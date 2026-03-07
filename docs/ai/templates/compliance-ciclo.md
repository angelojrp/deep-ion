# Template — Relatório de Compliance de Ciclo

> **Instruções:** Use este template para relatórios de compliance de sprints ou releases. Preencha com dados agregados de todas as demandas do ciclo. Delete as instruções entre `>` ao preencher.

---

# Relatório de Compliance — {Nome do Ciclo}

## Resumo Executivo

- **Ciclo:** {Sprint N / Release X.Y.Z}
- **Período:** {YYYY-MM-DD} — {YYYY-MM-DD}
- **Total de demandas:** {N}
- **Conformes:** {N} ({%})
- **Com desvios:** {N} ({%})
- **Desvios críticos:** {N}
- **Data do relatório:** {YYYY-MM-DD}

> Se taxa de conformidade < 90%:
> ```
> ⚠️ ALERTA: Taxa de conformidade abaixo da meta (90%). Revisão obrigatória de processos.
> ```

---

## Compliance por Classe T

| Classe | Total | Conformes | Com Desvios | Taxa de Conformidade |
|--------|-------|-----------|-------------|---------------------|
| T0 | | | | |
| T1 | | | | |
| T2 | | | | |
| T3 | | | | |
| **Total** | | | | |

---

## Demandas Auditadas

| # | Issue | Título | Classe T | Status | Conformidade | Desvios |
|---|-------|--------|----------|--------|-------------|---------|
| 1 | #{N} | | T{n} | | ✅/⚠️/❌ | {N} |

---

## Desvios Consolidados por Categoria

| Categoria | Qtd | CRÍTICO | ALTO | MÉDIO | BAIXO | Padrão Identificado |
|-----------|-----|---------|------|-------|-------|---------------------|
| Gate ignorado | | | | | | |
| Artefato ausente | | | | | | |
| Responsável incorreto | | | | | | |
| Etapa fora de ordem | | | | | | |
| Rastreabilidade quebrada | | | | | | |
| RN violada | | | | | | |
| LGPD não respeitada | | | | | | |
| Escalada não executada | | | | | | |
| **Total** | | | | | | |

---

## Análise de Responsabilidade

### Agentes Autônomos

| Agente | Demandas Processadas | Desvios | Taxa de Conformidade | Desvio Mais Frequente |
|--------|---------------------|---------|---------------------|-----------------------|
| DOM-01 | | | | |
| DOM-02 | | | | |
| DOM-03 | | | | |
| DOM-04 | | | | |
| DOM-05a | | | | |
| DOM-05b | | | | |

### Profissionais Humanos

| Papel | Gates Atuados | Tempo Médio de Resposta | Desvios | Observação |
|-------|--------------|------------------------|---------|------------|
| PO | | | | |
| Tech Lead | | | | |
| Arquiteto | | | | |
| QA | | | | |
| Domain Expert | | | | |

---

## Top 5 Desvios Mais Frequentes

| # | Desvio | Ocorrências | Impacto | Ação Corretiva Proposta |
|---|--------|-------------|---------|------------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---

## Indicadores do Ciclo

| Indicador | Meta | Realizado | Status | Tendência |
|-----------|------|-----------|--------|-----------|
| Taxa de conformidade de gates | ≥ 95% | | | |
| Taxa de rastreabilidade | 100% | | | |
| Tempo médio em gate (T0/T1) | ≤ 4h | | | |
| Tempo médio em gate (T2/T3) | ≤ 8h | | | |
| Taxa de escaladas resolvidas | ≥ 90% | | | |
| Cobertura do Audit Ledger | 100% | | | |

---

## Recomendações

### Ações Corretivas (desvios encontrados)
> {ação + responsável + prazo}

### Ações Preventivas (padrões identificados)
> {mudança de processo ou regra}

### Melhorias de Processo (oportunidades)
> {sugestões de otimização}

---

## Comparativo com Ciclo Anterior

> Se disponível, compare indicadores com o ciclo anterior.

| Indicador | Ciclo Anterior | Ciclo Atual | Variação |
|-----------|---------------|-------------|----------|
| Taxa de conformidade | | | |
| Desvios críticos | | | |
| Tempo médio em gate | | | |

---

*Relatório gerado pelo Gestor de Processos — Fábrica de Software Autônoma*
*Data: {YYYY-MM-DD}*
