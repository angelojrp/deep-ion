---
description: "Verificar compliance de um ciclo completo (sprint ou release). Audita todas as demandas do ciclo, identifica padrões de desvio e gera relatório consolidado."
mode: agent
agent: Gestor de Processos
---

# Compliance de Ciclo — Sprint ou Release

Você vai verificar a compliance de um ciclo completo da fábrica de software.

## Contexto

Carregue as seguintes skills antes de iniciar:
- `architecture/skills/SKILL-pipeline.md`
- `architecture/skills/SKILL-processos.md`
- `architecture/skills/SKILL-responsabilidades.md`
- `architecture/skills/SKILL-agentes.md`
- `architecture/skills/SKILL-modelo-classificacao.md`
- `architecture/skills/SKILL-regras-negociais.md`

## Instrução

1. **Identifique o ciclo** — sprint, milestone ou release a auditar
2. **Liste as demandas** — colete todas as issues/PRs do ciclo
3. **Audite cada demanda** — aplique o checklist de auditoria de processo individualmente
4. **Consolide resultados** — agrupe desvios por tipo e severidade
5. **Identifique padrões** — desvios recorrentes indicam problema sistêmico
6. **Analise responsabilidades** — quais agentes/humanos desviaram mais?
7. **Gere recomendações** — ações corretivas e preventivas

## Template de Output

```markdown
# Relatório de Compliance — {Ciclo}

## Resumo Executivo
- **Período:** {data início} — {data fim}
- **Total de demandas:** {N}
- **Conformes:** {N} ({%})
- **Com desvios:** {N} ({%})
- **Desvios críticos:** {N}

## Compliance por Classe T

| Classe | Total | Conformes | Desvios | Taxa |
|--------|-------|-----------|---------|------|
| T0 | | | | |
| T1 | | | | |
| T2 | | | | |
| T3 | | | | |

## Desvios por Categoria

| Categoria | Qtd | Severidade predominante | Padrão identificado |
|-----------|-----|------------------------|---------------------|

## Análise de Responsabilidade

### Agentes Autônomos
| Agente | Demandas processadas | Desvios | Taxa de conformidade |
|--------|---------------------|---------|---------------------|

### Profissionais Humanos
| Papel | Gates atuados | Desvios | Tempo médio de resposta |
|-------|--------------|---------|------------------------|

## Top 5 Desvios Mais Frequentes
{lista com ação corretiva para cada}

## Indicadores do Ciclo

| Indicador | Meta | Realizado | Status |
|-----------|------|-----------|--------|

## Recomendações
### Ações Corretivas (desvios encontrados)
### Ações Preventivas (padrões identificados)
### Melhorias de Processo (oportunidades)
```

Se a taxa de conformidade for inferior a 90%, destaque no resumo executivo como **alerta**.
