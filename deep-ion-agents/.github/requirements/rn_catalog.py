from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class BusinessRule:
    rn_id: str
    name: str
    modules: List[str]
    actions: List[str]
    deterministic_fe: Optional[str]
    description: str


RN_CATALOG: Dict[str, BusinessRule] = {
    "RN-01": BusinessRule(
        rn_id="RN-01",
        name="Validar saldo antes de débito",
        modules=["conta", "transacao"],
        actions=["debitar", "transferir", "saque", "pagamento"],
        deterministic_fe="Saldo Insuficiente",
        description="Executa podeDebitar() antes de qualquer débito.",
    ),
    "RN-02": BusinessRule(
        rn_id="RN-02",
        name="Transferência atômica",
        modules=["transacao", "conta"],
        actions=["transferir", "transferencia", "pix"],
        deterministic_fe="Falha na atomicidade da transferência",
        description="Transferência deve ocorrer em transação atômica com rollback integral.",
    ),
    "RN-03": BusinessRule(
        rn_id="RN-03",
        name="Bloquear exclusão de transação confirmada",
        modules=["transacao"],
        actions=["excluir", "deletar", "remover", "cancelar"],
        deterministic_fe="Tentativa de exclusão de transação confirmada",
        description="Transações CONFIRMADA não podem ser removidas.",
    ),
    "RN-04": BusinessRule(
        rn_id="RN-04",
        name="Orçamento apenas com CONFIRMADA",
        modules=["orcamento", "transacao", "relatorio"],
        actions=["calcular", "orcamento", "periodo", "filtrar"],
        deterministic_fe="Período inválido para cálculo de orçamento",
        description="Filtro de orçamento considera somente status CONFIRMADA.",
    ),
    "RN-05": BusinessRule(
        rn_id="RN-05",
        name="Publicar evento de meta atingida",
        modules=["meta", "objetivo", "notificacao"],
        actions=["atingir", "meta", "concluir", "acumular"],
        deterministic_fe=None,
        description="Publica MetaAtingidaEvent ao atingir meta.",
    ),
    "RN-06": BusinessRule(
        rn_id="RN-06",
        name="Bloquear exclusão de categoria padrão",
        modules=["categoria"],
        actions=["excluir", "deletar", "remover", "categoria"],
        deterministic_fe="Tentativa de exclusão de categoria padrão",
        description="Categorias com padrao=true não podem ser removidas.",
    ),
    "RN-07": BusinessRule(
        rn_id="RN-07",
        name="Fluxo de caixa só com CONFIRMADA",
        modules=["relatorio", "transacao", "fluxo-caixa"],
        actions=["fluxo", "caixa", "relatorio", "consolidar"],
        deterministic_fe="Transação não confirmada excluída do relatório",
        description="Relatório de fluxo de caixa considera somente CONFIRMADA.",
    ),
}


def _normalize(value: str) -> str:
    return value.strip().lower().replace("_", "-")


def get_rn_by_module(module: str, action: str) -> List[str]:
    module_key = _normalize(module)
    action_key = _normalize(action)

    matches: List[str] = []
    for rn_id, rule in RN_CATALOG.items():
        module_match = module_key in {_normalize(m) for m in rule.modules}
        action_match = action_key in {_normalize(a) for a in rule.actions}
        if module_match or action_match:
            matches.append(rn_id)
    return sorted(set(matches))


def get_fe_for_rn(rn_id: str) -> Optional[str]:
    rule = RN_CATALOG.get(rn_id)
    return rule.deterministic_fe if rule else None


def list_rn_catalog_markdown() -> str:
    lines = [
        "| RN | Regra | FE Determinístico |",
        "|---|---|---|",
    ]
    for rn_id in sorted(RN_CATALOG.keys()):
        rule = RN_CATALOG[rn_id]
        fe = rule.deterministic_fe or "Sem FE (evento MetaAtingidaEvent)"
        lines.append(f"| {rn_id} | {rule.name} | {fe} |")
    return "\n".join(lines)
