---
description: "Auditar conformidade de uma demanda específica contra o pipeline da fábrica. Verifica gates, artefatos obrigatórios, responsabilidades e rastreabilidade."
mode: agent
agent: Gestor de Processos
---

# Auditoria de Processo — Demanda Específica

Você vai auditar a conformidade de uma demanda contra o pipeline da fábrica.

## Contexto

Carregue as seguintes skills antes de iniciar:
- `architecture/skills/SKILL-pipeline.md`
- `architecture/skills/SKILL-processos.md`
- `architecture/skills/SKILL-responsabilidades.md`
- `architecture/skills/SKILL-agentes.md`
- `architecture/skills/SKILL-modelo-classificacao.md`

## Instrução

1. **Identifique a demanda** — solicite o ID da issue ou PR ao usuário, ou use o contexto fornecido
2. **Determine a classificação T** — verifique o DecisionRecord e labels aplicados
3. **Mapeie o pipeline esperado** — com base na classe T, identifique gates e artefatos obrigatórios
4. **Colete evidências** — verifique cada etapa: labels, comentários de gate, artefatos gerados
5. **Cruze evidências vs. esperado** — identifique etapas puladas, gates não cumpridos, artefatos ausentes
6. **Verifique responsabilidades** — os responsáveis corretos atuaram em cada gate? (RACI)
7. **Valide rastreabilidade** — a cadeia Issue → DecisionRecord → BAR → UC → ADR → PR → TestPlan está íntegra?
8. **Classifique desvios** — CRÍTICO / ALTO / MÉDIO / BAIXO
9. **Emita o relatório** — use o formato padrão de Relatório de Auditoria

## Output Esperado

Relatório de auditoria completo usando o template:

```markdown
# Relatório de Auditoria — {ID}

## Resumo Executivo
## Checklist do Pipeline
## Desvios Encontrados
## Cadeia de Rastreabilidade
## Análise RACI
## Recomendações
```

Se houver desvios CRÍTICOS, destaque-os no início do relatório com ação requerida.
