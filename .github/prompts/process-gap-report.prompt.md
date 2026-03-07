---
mode: agent
description: "Gera um relatório estratégico de GAP analysis de processo, comparando o estado atual da fábrica com um framework de referência. Use when: diagnosticar processo, GAP analysis, benchmarking, maturidade, melhoria de processo, PMBOK, Scrum, RUP, CMMI, ITIL."
name: "process-gap-report"
argument-hint: "Informe o processo alvo (ex: PROC-001, pipeline completo, QA negocial) e o framework de referência (ex: CMMI, PMBOK, Scrum, RUP, ITIL)"
---

Assuma o papel de **Diretor de Processos** da Fábrica de Software Autônoma.

---

## Parâmetros de entrada

| Campo | Valor |
|-------|-------|
| **Processo alvo** | `${input:targetProcess:Processo a analisar (ex: PROC-001, pipeline completo, Gate 2, QA negocial). Use "pipeline completo" para análise end-to-end.}` |
| **Framework de referência** | `${input:referenceFramework:Framework para benchmarking (ex: CMMI nível 3, PMBOK, Scrum, RUP, ITIL v4, SAFe, Lean). Pode informar mais de um separado por vírgula.}` |
| **Gerar plano de evolução** | `${input:generatePlan:Deseja gerar um plano de evolução formal em architecture/plans/? (sim/não)}` |

---

## Passo 1 — Coleta de contexto

1. Ler `architecture/skills/SKILL-pipeline.md` — fluxo completo do pipeline.
2. Ler `architecture/skills/SKILL-processos.md` — catálogo operacional de processos.
3. Ler `architecture/skills/SKILL-agentes.md` — responsabilidades dos agentes DOM-01..DOM-05b.
4. Ler `architecture/skills/SKILL-responsabilidades.md` — RACI e responsabilidades humanas.
5. Se o processo alvo for específico (ex: PROC-003), focar nos artefatos relevantes desse processo.

---

## Passo 2 — Mapeamento do estado atual

Descrever objetivamente:
- Etapas existentes, entradas, saídas e critérios de aceite do processo alvo
- Responsáveis (agentes autônomos e humanos)
- Mecanismos de controle de qualidade presentes (gates, checkpoints, bloqueios automáticos)
- Artefatos produzidos e sua rastreabilidade

---

## Passo 3 — Benchmarking com o framework de referência

Para cada framework informado em `referenceFramework`:
- Identificar as práticas, áreas de processo ou disciplinas que se aplicam ao processo alvo
- Mapear quais práticas já estão presentes (explícita ou implicitamente) no processo atual
- Identificar quais práticas estão ausentes, parciais ou com implementação fraca

---

## Passo 4 — GAP Analysis

Produzir tabela de GAPs com:

| # | GAP Identificado | Framework de Origem | Impacto | Prioridade |
|---|-----------------|---------------------|---------|------------|

**Critérios de impacto:**
- **Alto** — compromete qualidade da entrega, rastreabilidade ou conformidade regulatória
- **Médio** — gera retrabalho, atraso ou ambiguidade de responsabilidade
- **Baixo** — melhoria de eficiência ou clareza, sem risco imediato

**Critérios de prioridade:**
- **P1** — deve ser endereçado no próximo ciclo de melhoria
- **P2** — pode ser planejado para o ciclo seguinte
- **P3** — backlog de melhoria contínua

---

## Passo 5 — Recomendações Estratégicas

Para cada GAP P1 e P2, emitir recomendação com:
- O que fazer (ação concreta)
- Justificativa metodológica (por qual motivo o framework recomenda isso)
- Quem seria responsável pela implementação (agente autônomo ou papel humano)
- Dependências com outros processos ou artefatos

---

## Passo 6 — Plano de evolução (condicional)

Se `generatePlan == sim`:

1. Verificar o último ID de plano em `architecture/plans/` para definir o próximo ID sequencial.
2. Criar **novo** arquivo em `architecture/plans/` seguindo o template de `architecture/plans/_TEMPLATE.md`.
3. O plano deve conter:
   - Objetivo estratégico
   - Lista de iniciativas priorizadas (P1 → P2 → P3)
   - Responsável sugerido por iniciativa
   - Critérios de sucesso mensuráveis
   - Dependências entre iniciativas
4. Definir `status: PENDENTE` — o plano requer aprovação antes de execução.

Se `generatePlan == não`:
- Encerrar com o relatório de diagnóstico no chat.

---

## Formato do relatório final

```
## Relatório de GAP Analysis — [Processo Alvo]
**Framework(s) de referência:** [frameworks]
**Data:** [data]

### Estado Atual
[Descrição objetiva]

### Benchmarking Metodológico
[Tabela de práticas presentes vs ausentes por framework]

### GAPs Identificados
[Tabela de GAPs]

### Recomendações Estratégicas
[Lista priorizada com justificativas]

### Próximos Passos
[Plano gerado em architecture/plans/ OU indicação de que não foi solicitado]
```
