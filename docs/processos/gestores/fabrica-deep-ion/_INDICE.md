# Catálogo de Processos — Fábrica de Software Autônoma (`deep-ion`)

> **Versão:** 1.0 | **Atualizado em:** 2026-03-06 | **Responsável:** Gestor de Processos

---

## Estrutura do Catálogo

| ID | Documento | Descrição |
|----|-----------|-----------|
| — | [PROC-000 · Visão Geral da Fábrica](PROC-000_visao-geral-fabrica.md) | Pipeline completo, agentes, fluxogramas e conceitos-chave |
| PROC-001 | [Discovery e Classificação de Demanda](PROC-001_discovery-classificacao.md) | Recepção da issue, análise T0..T3, Gate 1 |
| PROC-002 | [Análise de Requisitos](PROC-002_analise-requisitos.md) | BAR, Use Cases, Matriz de Rastreabilidade, Checkpoint A |
| PROC-003 | [QA Negocial (Pré-Gate 2)](PROC-003_qa-negocial.md) | Completude, consistência, geração de TestPlan |
| PROC-004 | [Decisão Arquitetural](PROC-004_decisao-arquitetural.md) | ADR, esqueleto de código, Gate 3 |
| PROC-005 | [Implementação](PROC-005_implementacao.md) | Dev Agent, PR, testes, self-review |
| PROC-006 | [QA Técnico (Pré-Gate 4)](PROC-006_qa-tecnico.md) | Cobertura, Modulith, auditoria de RNs, Gates 4 e 5 |
| PROC-007 | [Modelo de Classificação T0→T3](PROC-007_modelo-classificacao.md) | Dimensões de score, zonas cinzas, reclassificação |
| PROC-008 | [Responsabilidades e Matriz RACI](PROC-008_raci.md) | RACI completo por gate, agente e papel humano |
| PROC-009 | [Regras Negociais (RN-01..RN-07)](PROC-009_regras-negociais.md) | Regras imutáveis do domínio fintech-pessoal |

---

## Gates do Pipeline

| Gate | Aprovadores | Disparado por | Libera |
|------|------------|---------------|--------|
| Gate 1 | PO + Domain Expert | `/gate1-approve` | DOM-02 |
| Checkpoint A | Analista / PO | `/ba-approve` | SKILL-REQ-02 |
| Gate 2 | PO + Tech Lead | `/gate2-approve` | DOM-03 |
| Gate 3 | Tech Lead + Arquiteto | `/gate3-approve` | DOM-04 |
| Gate 4 | Tech Lead | `/gate4-approve` | Gate 5 |
| Gate 5 | QA + PO | Homologação | Produção |

---

## Legenda de Status dos Agentes

| Ícone | Status |
|-------|--------|
| ✅ | Implementado |
| 📋 | Especificado (aguardando implementação) |
| 🔜 | Planejado |
