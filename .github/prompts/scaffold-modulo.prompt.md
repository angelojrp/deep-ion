---
mode: agent
description: Gera o Plano de Execução de scaffold para um módulo ou projeto usando um blueprint registrado.
tools:
  - codebase
  - editFiles
  - fetch
  - search
---

@arquiteto-corporativo

Carregue a skill de scaffold:

```
fetch architecture/skills/SKILL-scaffold.md
```

Com base na skill carregada e no blueprint informado, produza o **Plano de Execução de Scaffold** para o módulo ou projeto abaixo.

---

## Parâmetros da Requisição

| Campo           | Valor                              |
|-----------------|------------------------------------|
| **Módulo/Projeto** | ${input:moduleName:Nome do módulo ou projeto (ex: backoffice, dom-02)} |
| **Blueprint**   | ${input:blueprintName:Nome do blueprint (ex: python-agent-first, modulith-api-first)} |
| **Agente alvo** | ${input:agentId:ID do agente DOM, se aplicável (ex: dom-02, dom-05a) — deixe vazio se não aplicável} |

---

## O que produzir

1. Classificação de impacto T0→T3 para a operação de scaffold
2. Estrutura completa de diretórios e arquivos a serem criados (conforme blueprint)
3. Tabela de tarefas com agente executor, dependências e paralelismo
4. Conteúdo-referência de cada arquivo crítico (contratos de interface, entry points, modelos Pydantic base)
5. Checklist de conformidade do blueprint para o agente executor verificar após geração

Persista os arquivo do plano em `architecture/plans/PLAN-{YYYYMMDD}-{NNN}_scaffold-{moduleName}/`.