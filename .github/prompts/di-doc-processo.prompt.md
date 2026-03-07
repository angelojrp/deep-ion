---
description: "Documentar um processo operacional da fábrica de software. Cria ou atualiza documentação formal com entradas, saídas, responsáveis e critérios de aceite."
mode: agent
agent: Gestor de Processos
---

# Documentação de Processo Operacional

Você vai documentar um processo operacional da fábrica de software.

## Contexto

Carregue as seguintes skills antes de iniciar:
- `architecture/skills/SKILL-pipeline.md`
- `architecture/skills/SKILL-processos.md`
- `architecture/skills/SKILL-responsabilidades.md`
- `architecture/skills/SKILL-agentes.md`

## Instrução

1. **Identifique o processo** — pergunte ao usuário qual processo documentar, ou identifique pelo contexto
2. **Verifique se já existe** — consulte `docs/business/processos/` para evitar duplicidade
3. **Colete informações** — analise o pipeline, skills dos agentes e artefatos existentes
4. **Documente o fluxo** — use o template padrão de Documentação de Processo
5. **Identifique exceções** — fluxos alternativos, escaladas e regras de bloqueio
6. **Defina indicadores** — métricas de conformidade e performance do processo
7. **Persista o documento** — salve em `docs/business/processos/PROC-{NNN}_{slug}.md`

## Template de Output

```markdown
# Processo: {Nome do Processo}

## Metadados
- **ID:** PROC-{NNN}
- **Versão:** 1.0
- **Última atualização:** {YYYY-MM-DD}
- **Responsável:** {papel}
- **Processos relacionados:** {IDs}

## Objetivo
{descrição clara}

## Pré-condições
{entradas obrigatórias}

## Fluxo Principal
| # | Etapa | Responsável | Entrada | Saída | Critério de Aceite |
|---|-------|-------------|---------|-------|---------------------|

## Fluxos Alternativos
{desvios e exceções}

## Regras de Negócio Aplicáveis
{RNs que governam este processo}

## Critérios de Bloqueio
{condições que impedem avanço}

## Indicadores
{métricas}
```

Sempre vincule o processo ao pipeline da fábrica e à matriz RACI.
