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
from rn_catalog import get_fe_for_rn


def _find_latest_bar(comments: List[Dict]) -> str:
    for comment in reversed(comments):
        body = comment.get("body", "") or ""
        if body.startswith("## BAR-"):
            return body
    return ""


def _parse_rns_from_bar(bar: str) -> List[str]:
    return sorted(set(re.findall(r"RN-[0-9]{2}", bar)))


def _parse_uc_names_from_bar(bar: str, issue_number: int) -> List[Tuple[str, str]]:
    rows = []
    for line in bar.splitlines():
        if line.strip().startswith("|") and f"UC-{issue_number}" in line:
            parts = [p.strip() for p in line.strip("|").split("|")]
            if len(parts) >= 2 and parts[0].startswith("UC-"):
                rows.append((parts[0], parts[1]))
    if not rows:
        rows.append((f"UC-{issue_number}-01", "Fluxo principal"))
    return rows


def _build_fallback_uc(issue_number: int, classification: str, bar_markdown: str) -> str:
    rns = _parse_rns_from_bar(bar_markdown)
    uc_rows = _parse_uc_names_from_bar(bar_markdown, issue_number)

    uc_blocks: List[str] = []
    matrix_lines = [
        "## Matriz de Rastreabilidade",
        "| Issue | RN Acionada | UC | Módulo | Cenário Gherkin | Teste Esperado |",
        "|---|---|---|---|---|---|",
    ]

    for idx, (uc_id, uc_name) in enumerate(uc_rows, start=1):
        module = "transacao"
        rn_list = ", ".join(rns) if rns else "N/A"
        fe_rows = []
        gherkin_rows = [
            "Scenario: Caminho feliz",
            "Given contexto válido",
            "When o ator executa o fluxo principal",
            "Then o sistema conclui a operação com sucesso",
            "",
        ]
        for fe_idx, rn in enumerate(rns, start=1):
            fe = get_fe_for_rn(rn)
            if not fe:
                continue
            fe_name = f"FE-{fe_idx}: {fe}"
            fe_rows.extend(
                [
                    f"FE-{fe_idx}: {fe} — Bifurca no Passo 2",
                    f"Gatilho: violação de {rn}",
                    f"RN Violada: {rn}",
                    f"Resposta do Sistema: bloquear operação com mensagem '{fe}'",
                    "",
                ]
            )
            gherkin_rows.extend(
                [
                    f"Scenario: FE-{fe_idx}",
                    f"Given condição de violação {rn}",
                    "When o ator tenta executar a ação",
                    f"Then o sistema retorna '{fe}'",
                    "",
                ]
            )
            matrix_lines.append(
                f"| #{issue_number} | {rn} | {uc_id} | {module} | FE-{fe_idx}: {fe} | `{module.title()}ServiceTest#deveCobrir{rn.replace('-', '')}` |"
            )

        exception_rows = fe_rows if fe_rows else ["N/A"]

        uc_blocks.extend(
            [
                f"## {uc_id}: {uc_name}",
                f"**Módulo:** `{module}` | **Classificação:** {classification} | **Versão:** 1.0",
                f"**RNs Acionadas:** {rn_list}",
                "**Ator Principal:** Usuário de negócio | **Atores Secundários:** Sistema de validação",
                "",
                "### Pré-condições",
                "- Usuário autenticado.",
                "",
                "### Pós-condições de Sucesso",
                "- Estado de negócio persistido.",
                "",
                "### Pós-condições de Falha",
                "- Nenhuma alteração persistida em caso de FE.",
                "",
                "### Fluxo Principal",
                "| Passo | Ator | Ação | Resposta do Sistema |",
                "|---|---|---|---|",
                "| 1 | Usuário | Inicia operação | Sistema valida pré-condições |",
                "| 2 | Usuário | Confirma ação | Sistema aplica regras de negócio |",
                "| 3 | Sistema | Finaliza fluxo | Sistema confirma sucesso |",
                "",
                "### Fluxos Alternativos",
                "FA-1: Dados opcionais ausentes — Bifurca no Passo 1",
                "",
                "### Fluxos de Exceção",
                *exception_rows,
                "### Invariantes",
                "- Regras RN aplicadas antes de persistência.",
                "",
                "### Critérios de Aceitação — Gherkin",
                *gherkin_rows,
                "### RNFs Aplicáveis",
                "| Atributo | Métrica | Fonte |",
                "|---|---|---|",
                "| Latência | <= 2s por operação | NFR padrão DOM-02 |",
                "| Confiabilidade | 100% aderência RN acionadas | DOM-02_SPEC |",
                "",
                "---",
                "",
            ]
        )

    return "\n".join(uc_blocks + matrix_lines)


def _validate_deterministic_fes(markdown: str, rns: List[str]) -> List[str]:
    missing = []
    lowered = markdown.lower()
    for rn in rns:
        fe = get_fe_for_rn(rn)
        if not fe:
            continue
        if fe.lower() not in lowered:
            missing.append(rn)
    return missing


def main() -> None:
    parser = argparse.ArgumentParser(description="SKILL-REQ-02 Use Case Modeler Agent")
    parser.add_argument("--issue", type=int, required=True)
    args = parser.parse_args()

    gh = GitHubAPI()
    issue = gh.get_issue(args.issue)
    comments = gh.list_issue_comments(args.issue)

    bar = _find_latest_bar(comments)
    if not bar:
        raise RuntimeError("BAR aprovado não encontrado na issue. REQ-02 exige input BAR-only.")

    if re.search(r"lgpd_scope:\s*true", bar, flags=re.IGNORECASE):
        decision = DecisionRecord(
            skill="SKILL-REQ-02",
            issue_id=args.issue,
            decision_type="gate",
            decision="escalar",
            confidence_score=0.6,
            rn_triggered=_parse_rns_from_bar(bar),
            modules_affected=["transacao"],
            approval_weight=0.0,
            justification="LGPD detectado sem aprovação humana explícita.",
            artifacts_produced=[],
            lgpd_scope=True,
        )
        gh.post_issue_comment(args.issue, format_decision_record_markdown(decision))
        gh.add_labels(args.issue, ["qa/bloqueado"])
        return

    classification = "T1"
    explicit = re.search(r"Classificação:\s*(T[0-3])", bar)
    if explicit:
        classification = explicit.group(1)

    prompt_template = load_prompt_file(str(CURRENT_DIR / "prompts" / "uc_generation.md"))
    prompt = "\n\n".join(
        [
            prompt_template,
            "## BAR aprovado",
            bar,
            f"issue_number: {args.issue}",
            f"classification: {classification}",
        ]
    )

    fallback = _build_fallback_uc(args.issue, classification, bar)
    uc_markdown = call_llm(prompt=prompt, fallback=fallback)
    if not uc_markdown.strip().startswith("## UC-"):
        uc_markdown = fallback

    rns = _parse_rns_from_bar(bar)
    missing = _validate_deterministic_fes(uc_markdown, rns)
    if missing:
        extra_lines = ["", "### Complemento Determinístico RN→FE"]
        for rn in missing:
            fe = get_fe_for_rn(rn)
            if fe:
                extra_lines.append(f"- {rn}: {fe}")
        uc_markdown += "\n" + "\n".join(extra_lines)

    gh.post_issue_comment(args.issue, uc_markdown)
    gh.add_labels(args.issue, ["gate/2-aguardando"])

    decision = DecisionRecord(
        skill="SKILL-REQ-02",
        issue_id=args.issue,
        decision_type="gate",
        decision="avançar",
        confidence_score=0.8,
        rn_triggered=rns,
        modules_affected=["transacao"],
        approval_weight=0.0,
        justification="UCs canônicos e matriz publicados para Gate 2.",
        artifacts_produced=[f"UC-{args.issue}", "Matriz de Rastreabilidade"],
        lgpd_scope=False,
    )
    gh.post_issue_comment(args.issue, format_decision_record_markdown(decision))


if __name__ == "__main__":
    main()
