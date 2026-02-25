#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from ai_provider import call_llm, load_prompt_file
from audit_ledger import DecisionRecord, format_decision_record_markdown
from github_api import GitHubAPI
from rn_catalog import RN_CATALOG, list_rn_catalog_markdown


def _extract_duplicate_report(comments: List[Dict]) -> str:
    for comment in reversed(comments):
        body = comment.get("body", "") or ""
        if body.startswith("## DuplicateReport-"):
            return body
    return ""


def _extract_rn_hits(text: str) -> List[str]:
    lowered = text.lower()
    hits = []
    for rn_id, rule in RN_CATALOG.items():
        if any(module in lowered for module in rule.modules) or any(action in lowered for action in rule.actions):
            hits.append(rn_id)
    return sorted(set(hits))


def _build_fallback_bar(issue_number: int, title: str, body: str, duplicate_report: str) -> str:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    rn_hits = _extract_rn_hits(f"{title}\n{body}")
    ambiguity_items = [
        "Definir fluxo principal em passos testáveis.",
        "Confirmar pré-condições e pós-condições operacionais.",
    ]
    if not rn_hits:
        ambiguity_items.append("Confirmar se há regra de negócio específica fora do catálogo RN-01..RN-07.")

    confidence = 0.72 if rn_hits else 0.68
    confidence_label = "média" if confidence >= 0.65 else "baixa"
    recommendation = "escalar" if confidence < 0.65 else "revisar"
    rn_rows = [
        f"| {rn_id} | Aplicável ao fluxo descrito | Não | Validar detalhes no Checkpoint A |"
        for rn_id in rn_hits
    ]
    if not rn_rows:
        rn_rows = ["| N/A | N/A | Não | Nenhuma RN acionada explicitamente |"]

    return "\n".join(
        [
            f"## BAR-{issue_number}: Análise Negocial",
            f"**Issue:** #{issue_number} | **Classificação:** T1 (score: 1.0) | **Data:** {now}",
            f"**Confiança:** {confidence_label} | **Agente:** SKILL-REQ-01 v1.0",
            "",
            "### Síntese da Necessidade",
            f"- {title}",
            "",
            "### Escopo Delimitado",
            "- Dentro do escopo:",
            f"  - {title}",
            "- Fora do escopo (explícito):",
            "  - Mudanças não descritas na issue.",
            "- Ambiguidades não resolvidas:",
            *[f"  - {item}" for item in ambiguity_items],
            "",
            "### Regras de Negócio Acionadas",
            "| RN | Impacto | Conflito? | Observação |",
            "|---|---|---|---|",
            *rn_rows,
            "",
            "### Módulos Afetados",
            "| Módulo | Tipo de Impacto | Justificativa |",
            "|---|---|---|",
            "| transacao | funcional | Demanda descreve alteração de comportamento de negócio |",
            "",
            "### Use Cases Identificados",
            "| UC | Nome Provisório | Prioridade | Dependência |",
            "|---|---|---|---|",
            f"| UC-{issue_number}-01 | {title} | Must | N/A |",
            "",
            "### Pontos de Atenção",
            "- Revisar conflitos com regras RN antes do Gate 2.",
            "- Confirmar linguagem de aceitação em Gherkin no próximo passo.",
            "",
            "### Recomendação do Agente",
            f"{recommendation} — Necessária validação humana de ambiguidades antes do avanço.",
            "",
            "### Meta de Confiança",
            f"confidence_score: {confidence:.2f}",
            "confidence_dimensions:",
            f"- escopo: {max(confidence - 0.02, 0.0):.2f}",
            f"- regras_de_negocio: {max(confidence - 0.04, 0.0):.2f}",
            f"- completude: {max(confidence - 0.05, 0.0):.2f}",
            f"- riscos: {max(confidence - 0.03, 0.0):.2f}",
            "lgpd_scope: false",
            "",
            "### Referência DuplicateReport",
            duplicate_report or "N/A",
        ]
    )


def _extract_confidence(bar_markdown: str) -> float:
    match = re.search(r"confidence_score:\s*([0-9]*\.?[0-9]+)", bar_markdown)
    return float(match.group(1)) if match else 0.6


def _extract_lgpd_scope(bar_markdown: str, issue_text: str) -> bool:
    if re.search(r"lgpd_scope:\s*true", bar_markdown, flags=re.IGNORECASE):
        return True
    return bool(re.search(r"lgpd|cpf|cnpj|dados pessoais", issue_text, flags=re.IGNORECASE))


def _has_critical_ambiguity(bar_markdown: str) -> bool:
    marker = "Ambiguidades não resolvidas"
    if marker not in bar_markdown:
        return True
    section = bar_markdown.split(marker, maxsplit=1)[1][:500]
    return any(term in section.lower() for term in ["crítica", "critica", "fluxo principal", "rn", "não definido", "nao definido"])


def main() -> None:
    parser = argparse.ArgumentParser(description="SKILL-REQ-01 Business Analyst Agent")
    parser.add_argument("--issue", type=int, required=True)
    args = parser.parse_args()

    gh = GitHubAPI()
    issue = gh.get_issue(args.issue)
    comments = gh.list_issue_comments(args.issue)

    duplicate_report = _extract_duplicate_report(comments)
    issue_title = issue.get("title", "")
    issue_body = issue.get("body", "") or ""
    issue_text = f"{issue_title}\n{issue_body}"

    prompt_template = load_prompt_file(str(CURRENT_DIR / "prompts" / "bar_generation.md"))
    prompt = "\n\n".join(
        [
            prompt_template,
            "## Catálogo RN inline",
            list_rn_catalog_markdown(),
            "## Contexto da Issue",
            f"issue_number: {args.issue}",
            f"issue_title: {issue_title}",
            f"issue_body:\n{issue_body}",
            "## DuplicateReport",
            duplicate_report or "N/A",
        ]
    )

    fallback = _build_fallback_bar(args.issue, issue_title, issue_body, duplicate_report)
    bar_markdown = call_llm(prompt=prompt, fallback=fallback)

    if not bar_markdown.strip().startswith("## BAR-"):
        bar_markdown = fallback

    gh.post_issue_comment(args.issue, bar_markdown)

    confidence_score = _extract_confidence(bar_markdown)
    lgpd_scope = _extract_lgpd_scope(bar_markdown, issue_text)
    critical_ambiguity = _has_critical_ambiguity(bar_markdown)

    should_escalate = confidence_score < 0.65 or lgpd_scope or critical_ambiguity

    gh.add_labels(args.issue, ["req/bar-aguardando"])
    if should_escalate:
        gh.add_labels(args.issue, ["qa/bloqueado"])
    else:
        gh.remove_labels(args.issue, ["qa/bloqueado"])

    decision = DecisionRecord(
        skill="SKILL-REQ-01",
        issue_id=args.issue,
        decision_type="checkpoint",
        decision="escalar" if should_escalate else "avançar",
        confidence_score=confidence_score,
        rn_triggered=_extract_rn_hits(issue_text),
        modules_affected=["transacao"],
        approval_weight=0.4,
        justification=(
            "Checkpoint A bloqueado por ambiguidades críticas/LGPD/confiança" if should_escalate else "BAR gerado para revisão humana"
        ),
        artifacts_produced=[f"BAR-{args.issue}"],
        lgpd_scope=lgpd_scope,
    )
    gh.post_issue_comment(args.issue, format_decision_record_markdown(decision))


if __name__ == "__main__":
    main()
