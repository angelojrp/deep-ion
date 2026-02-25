#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Tuple

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from audit_ledger import DecisionRecord, format_decision_record_markdown
from github_api import GitHubAPI
from rn_catalog import RN_CATALOG, get_rn_by_module
from uc_repository import GitHubIssueClient, find_similar_ucs


def _extract_modules(text: str) -> List[str]:
    lowered = text.lower()
    modules = []
    for rule in RN_CATALOG.values():
        for module in rule.modules:
            if module in lowered:
                modules.append(module)
    return sorted(set(modules))


def _extract_actions(text: str) -> List[str]:
    lowered = text.lower()
    actions = []
    for rule in RN_CATALOG.values():
        for action in rule.actions:
            if action in lowered:
                actions.append(action)
    return sorted(set(actions))


def _detect_rn_conflicts(text: str) -> List[str]:
    lowered = text.lower()
    patterns = {
        "RN-01": [r"sem\s+validar\s+saldo", r"ignorar\s+saldo"],
        "RN-02": [r"sem\s+transa[cç][aã]o", r"n[aã]o\s+at[oô]mic"],
        "RN-03": [r"excluir\s+transa[cç][aã]o\s+confirmada"],
        "RN-04": [r"or[cç]amento.*pendente", r"incluir.*n[aã]o\s+confirmada.*or[cç]amento"],
        "RN-06": [r"excluir\s+categoria\s+padr[aã]o"],
        "RN-07": [r"fluxo\s+de\s+caixa.*n[aã]o\s+confirmada"],
    }
    conflicts = []
    for rn, rn_patterns in patterns.items():
        if any(re.search(pattern, lowered) for pattern in rn_patterns):
            conflicts.append(rn)
    return sorted(set(conflicts))


def _parallel_issues_warning(gh: GitHubAPI, issue_number: int, modules: List[str]) -> List[str]:
    if not modules:
        return []
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    warnings: List[str] = []
    for issue in gh.list_recent_issues(per_page=100, state="open"):
        if int(issue.get("number", 0)) == issue_number:
            continue
        created_at = issue.get("created_at")
        if not created_at:
            continue
        created_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        if created_dt < thirty_days_ago:
            continue
        content = f"{issue.get('title', '')}\n{issue.get('body', '')}".lower()
        overlaps = [module for module in modules if module in content]
        if overlaps:
            warnings.append(f"Issue #{issue.get('number')} com módulos em paralelo: {', '.join(overlaps)}")
    return warnings


def _dependency_warning(issue_text: str, known_uc_ids: List[str]) -> List[str]:
    dependencies = re.findall(r"UC-[A-Za-z0-9._-]+", issue_text)
    missing = sorted({dep for dep in dependencies if dep not in set(known_uc_ids)})
    return [f"Dependência não implementada: {dep}" for dep in missing]


def _estimate_classification(issue_text: str, triggered_rns: List[str]) -> str:
    explicit = re.search(r"\bT([0-3])\b", issue_text.upper())
    if explicit:
        return f"T{explicit.group(1)}"
    if any(rn in {"RN-01", "RN-02", "RN-03"} for rn in triggered_rns):
        return "T2"
    if triggered_rns:
        return "T1"
    return "T0"


def _classification_warning(issue_text: str, estimated: str) -> str:
    explicit = re.search(r"\bT([0-3])\b", issue_text.upper())
    if not explicit:
        return ""
    declared = f"T{explicit.group(1)}"
    if declared == estimated:
        return ""
    return f"Classificação divergente: declarada {declared}, estimada {estimated} (sugestão: /reclassify)."


def main() -> None:
    parser = argparse.ArgumentParser(description="SKILL-REQ-00 Duplicate & Conflict Detector")
    parser.add_argument("--issue", type=int, required=True)
    args = parser.parse_args()

    gh = GitHubAPI()
    issue = gh.get_issue(args.issue)
    title = issue.get("title", "")
    body = issue.get("body", "") or ""
    issue_text = f"{title}\n{body}"

    modules = _extract_modules(issue_text)
    actions = _extract_actions(issue_text)

    triggered_rns = set()
    for module in modules or ["transacao", "conta", "categoria", "relatorio", "orcamento", "meta"]:
        for action in actions or ["analisar"]:
            triggered_rns.update(get_rn_by_module(module, action))

    uc_client = GitHubIssueClient(repo=os.getenv("GITHUB_REPOSITORY"), token=os.getenv("GITHUB_TOKEN"))
    similar_ucs = find_similar_ucs(issue_text, threshold=0.8, client=uc_client)
    known_uc_ids = [item["uc_id"] for item in similar_ucs]

    conflicts = _detect_rn_conflicts(issue_text)
    parallel_warnings = _parallel_issues_warning(gh, args.issue, modules)
    dependency_warnings = _dependency_warning(issue_text, known_uc_ids)
    estimated_classification = _estimate_classification(issue_text, sorted(triggered_rns))
    class_warning = _classification_warning(issue_text, estimated_classification)

    duplicate_critical = bool(similar_ucs and triggered_rns and modules)
    block_rn_violation = bool(conflicts)
    should_block = duplicate_critical or block_rn_violation

    report_lines = [
        f"## DuplicateReport-{args.issue}",
        f"**Issue:** #{args.issue}",
        "",
        "### V1 — Duplicatas semânticas",
    ]
    if similar_ucs:
        report_lines.append("| Issue | UC | Similaridade |")
        report_lines.append("|---|---|---|")
        for item in similar_ucs[:10]:
            report_lines.append(f"| #{item['issue_number']} | {item['uc_id']} | {item['similarity']:.2f} |")
    else:
        report_lines.append("Nenhuma duplicata acima de 80%.")

    report_lines.extend(["", "### V2 — Conflitos com RN"])
    report_lines.append(", ".join(conflicts) if conflicts else "Nenhum conflito explícito detectado.")

    report_lines.extend(["", "### V3 — Issues paralelas (30 dias)"])
    report_lines.extend(parallel_warnings or ["Nenhuma issue paralela relevante detectada."])

    report_lines.extend(["", "### V4 — Dependências de UC"])
    report_lines.extend(dependency_warnings or ["Sem dependências explícitas pendentes."])

    report_lines.extend(["", "### V5 — Classificação"])
    report_lines.append(class_warning or "Classificação consistente.")

    report_lines.extend(["", f"**Resultado:** {'BLOQUEADO' if should_block else 'LIMPO'}"])

    gh.post_issue_comment(args.issue, "\n".join(report_lines))

    if should_block:
        gh.add_labels(args.issue, ["blocked/rn-violation"])
        gh.remove_labels(args.issue, ["req/duplicatas-verificadas"])
    else:
        gh.add_labels(args.issue, ["req/duplicatas-verificadas"])
        gh.remove_labels(args.issue, ["blocked/rn-violation"])

    decision = DecisionRecord(
        skill="SKILL-REQ-00",
        issue_id=args.issue,
        decision_type="block" if should_block else "alert",
        decision="bloquear" if should_block else "avançar",
        confidence_score=0.9 if not conflicts else 0.7,
        rn_triggered=sorted(triggered_rns),
        modules_affected=modules,
        approval_weight=0.0,
        justification=(
            "Violação de RN detectada" if block_rn_violation else "Duplicata crítica detectada" if duplicate_critical else "Sem bloqueios"
        ),
        artifacts_produced=[f"DuplicateReport-{args.issue}"],
        lgpd_scope=False,
    )
    gh.post_issue_comment(args.issue, format_decision_record_markdown(decision))


if __name__ == "__main__":
    main()
