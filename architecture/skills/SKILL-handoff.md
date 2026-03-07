# SKILL — Protocolo de Handoff IA↔Humano

## Visão Geral

Handoffs explícitos são necessários porque a fábrica opera com agentes IA que entregam artefatos
para revisão humana em gates definidos. Sem um protocolo formal, passagens de controle são
implícitas: o humano não sabe que está sendo esperado, o SLA não corre, escaladas não acontecem.

Este SKILL define o contrato mínimo de toda transferência de controle IA→Humano ou IA→IA na
fábrica deep-ion.

---

## Handoff Card — Template Padrão

Todo agente IA DEVE preencher este card antes de transferir controle para o próximo responsável:

| Campo | Valor |
|-------|-------|
| **gate** | [Gate N / Checkpoint X] |
| **demanda_id** | #[número da issue] |
| **agente_origem** | [nome do agente que entrega] |
| **responsável_destino** | [papel humano ou agente que recebe] |
| **artefatos_entregues** | [lista de artefatos produzidos com link] |
| **artefatos_pendentes** | [itens que ficaram fora do escopo desta entrega] |
| **alertas** | [riscos, inconsistências, pontos de atenção] |
| **sla_iniciado_em** | [timestamp ISO 8601] |
| **sla_expira_em** | [timestamp ISO 8601 = sla_iniciado_em + SLA do gate] |
| **status** | AGUARDANDO_REVISÃO / APROVADO / REJEITADO / ESCALADO |

---

## Protocolo por Gate

### Gate 1 — Discovery
- **Artefato de entrada obrigatório:** Issue GitHub aberta com título e descrição
- **Agente executor:** DOM-01 (Discovery Agent / Analista de Negócios)
- **Artefato produzido:** DecisionRecord + label de classificação T0..T3
- **Revisor humano:** PO (obrigatório) + Domain Expert (se T3 ou risk_level ≥ HIGH)
- **SLA máximo:** 4h após acionamento
- **Critério de escalada:** confidence_score < 0.65 → escalar imediatamente via Handoff Card com status=ESCALADO

### Checkpoint A — Business Analysis Record
- **Artefato de entrada obrigatório:** Gate 1 aprovado + DecisionRecord
- **Agente executor:** DOM-02 (Requirements Agent / Analista de Negócios)
- **Artefato produzido:** BAR (BusinessAnalysisRecord) completo
- **Revisor humano:** Analista Sênior + PO
- **SLA máximo:** 2h após BAR submetido
- **Critério de escalada:** Conflito com RN existente → escalar com referência à RN conflitante

### Gate 2 — Requisitos
- **Artefato de entrada obrigatório:** Checkpoint A aprovado + BAR + Use Cases + Matriz de Rastreabilidade + TestPlan (DOM-05a)
- **Agente executor:** DOM-02 + DOM-05a (QA Negocial)
- **Artefatos produzidos:** Use Cases completos + Matriz + TestPlan-{ID}
- **Revisores humanos:** PO (obrigatório) + Tech Lead (obrigatório)
- **SLA máximo:** 8h após submissão dos artefatos
- **Critério de escalada:** Inconsistência crítica BAR→UC → gate bloqueia, Gestor de Squads notificado

### Gate 3 — Arquitetura
- **Artefato de entrada obrigatório:** Gate 2 aprovado + BAR + Use Cases + TestPlan
- **Agente executor:** DOM-03 (Architecture Agent / Arquiteto Corporativo)
- **Artefatos produzidos:** ADR + esqueleto de código
- **Revisores humanos:** Tech Lead (obrigatório) + Arquiteto (obrigatório)
- **SLA máximo:** 8h após submissão do ADR
- **Critério de escalada:** Impacto em múltiplos módulos ou mudança de contrato público → escalar antes de concluir ADR

### Gate 4 — Code Review
- **Artefato de entrada obrigatório:** Gate 3 aprovado + ADR + TestPlan + PR aberto
- **Agente executor:** DOM-04 (Dev Agent) + DOM-05b (QA Técnico)
- **Artefatos produzidos:** PR com implementação + testes + relatório DOM-05b
- **Revisor humano:** Tech Lead (obrigatório)
- **SLA máximo:** 4h de revisão após PR aberto
- **Critério de escalada:** Violação de RN-01/RN-02/RN-03 → REQUEST_CHANGES automático; impossibilidade técnica de conformidade com ADR → escalar ao Arquiteto

### Gate 5 — Homologação
- **Artefato de entrada obrigatório:** Gate 4 aprovado + PR mergeado
- **Artefatos produzidos:** Relatório de homologação
- **Revisores humanos:** QA (obrigatório) + PO (obrigatório)
- **SLA máximo:** 24h após gate 4 aprovado
- **Critério de escalada:** Regressão crítica em produção → Tech Lead + PO + Arquiteto

---

## Escalation Ladder

Quando um agente IA identifica condição de escalada, deve:

1. Preencher Handoff Card com `status: ESCALADO` e campo `alertas` detalhado
2. Seguir a ladder abaixo:

```
Nível 1: DOM-XX (Agente IA)
         ↓ [condição de escalada detectada]
Nível 2: Gestor de Squads
         → registra em docs/squad/gestores/
         → monitora SLA, notifica responsável humano do gate
         ↓ [sem resposta em 2h / severidade CRÍTICA]
Nível 3: Diretor de Squads
         → avaliação estratégica de bloqueio
         → decisão sobre reclassificação ou desbloqueio
         ↓ [decisão requer aprovação humana]
Nível 4: Papel humano responsável pelo gate
         Gate 1 / CheckA / Gate 2 / Gate 5 → PO → Domain Expert
         Gate 3 → Tech Lead → Arquiteto
         Gate 4 → Tech Lead
```

---

## SLA Consolidado por Gate

| Gate | SLA de execução (IA) | SLA de revisão (Humano) | Escalada automática em |
|------|---------------------|------------------------|------------------------|
| Gate 1 | 2h | 4h | 4h sem resposta do PO |
| Checkpoint A | 2h | 2h | 2h sem resposta do Analista/PO |
| Gate 2 | 4h | 8h | 8h sem resposta do PO+TechLead |
| Gate 3 | 4h | 8h | 8h sem resposta do TechLead+Arquiteto |
| Gate 4 | 6h | 4h | 4h sem resposta do Tech Lead |
| Gate 5 | — | 24h | 24h sem resposta do QA+PO |
