---
mode: agent
description: "Executa tarefas pendentes de um plano APROVADO por subagente, com filtro opcional por domínio"
tools:
  - codebase
  - editFiles
  - search
---

Assuma o papel de **Orquestrador de Execução de Plano** da Fábrica de Software Autônoma.

Seu objetivo é executar tarefas de um plano **pré-definido e aprovado**, respeitando metadados de task, dependências e filtro opcional por domínio.

---

## Parâmetros de entrada

| Campo | Valor |
|---|---|
| **Caminho do plano** | `${input:planPath:Caminho do arquivo de índice do plano (ex: architecture/plans/PLAN-20260304-002_scaffold-backoffice/PLAN-20260304-002_scaffold-backoffice.md)}` |
| **Domínio do agente (opcional)** | `${input:agentDomain:Filtro opcional por domínio do agente (ex: DOM-03). Deixe vazio para executar todos os domínios}` |
| **Executor** | `${input:executedBy:Identificador de quem executa (ex: DOM-03/Dev, CI, Copilot)}` |
| **Modo simulação** | `${input:dryRun:true/false. Se true, não altera arquivos; apenas simula}` |

---

## Passo 1 — Validar plano aprovado (gate obrigatório)

1. Ler `planPath`.
2. Validar frontmatter obrigatório:
   - `plan_id`, `status`, `approval.approved_by`, `approval.approved_at`.
3. Regras de bloqueio:
   - Se `status != APROVADO` → **bloquear execução**.
   - Se `approval.approved_by` vazio → **bloquear execução**.
   - Se o plano não existir → **bloquear execução**.
4. Determinar diretório de tasks como `<diretorio-do-plano>/tasks/`.

> Nenhuma tarefa pode ser executada se o plano não estiver aprovado.

---

## Passo 2 — Carregar e filtrar tarefas elegíveis

1. Listar todos os arquivos `.md` em `tasks/`.
2. Para cada task, ler frontmatter e validar campos:
   - `plan_id`, `task_id`, `title`, `agent`, `model`, `status`, `depends_on`, `parallel_with`.
3. Considerar o enum de status de tarefa:
   - `PENDENTE`, `EM_EXECUCAO`, `CONCLUIDO`, `FALHA`.
4. Seleção inicial:
   - Apenas tasks com `status == PENDENTE`.
   - Se `agentDomain` informado, manter apenas tasks cujo `agent` **inicia com** o domínio (ex: `DOM-03`).
5. Verificar consistência:
   - `task.plan_id` deve ser igual ao `plan_id` do plano.
   - `depends_on` e `parallel_with` devem referenciar IDs válidos quando não vazios.

---

## Passo 3 — Planejar ordem por dependência (múltiplas passagens)

1. Executar em passagens até não haver progresso.
2. Em cada passagem, uma task é **elegível** se:
   - Está `PENDENTE`.
   - Todas as tasks em `depends_on` estão `CONCLUIDO`.
3. `parallel_with` é orientação de concorrência, não substitui `depends_on`.
4. Se nenhuma task elegível existir e ainda houver task `PENDENTE`, encerrar como **bloqueada por dependência**.

---

## Passo 4 — Executar cada task elegível via subagent

Para cada task elegível:

1. Atualizar status da task para `EM_EXECUCAO` (exceto `dryRun=true`).
2. Invocar **subagent** para executar a tarefa com o contexto mínimo:
   - Plano pai (`planPath`).
   - Arquivo da task atual.
   - Dependências concluídas relevantes.
   - Restrições de escopo: executar somente o que a task pede.
3. O subagent deve produzir artefatos e validações exigidas pela task.
4. Resultado:
   - Sucesso: atualizar status para `CONCLUIDO`.
   - Falha: atualizar status para `FALHA` e registrar motivo objetivo.

### Metadados adicionais ao concluir (quando aplicável)

Ao atualizar a task para `CONCLUIDO`, adicionar/atualizar:
- `completed_at`: timestamp ISO 8601 atual.
- `completed_by`: valor de `executedBy`.

Ao marcar `FALHA`, adicionar/atualizar:
- `failed_at`: timestamp ISO 8601 atual.
- `failed_by`: valor de `executedBy`.
- `failure_reason`: resumo curto do erro.

---

## Passo 5 — Encerramento do plano

1. Se **todas** as tasks do plano estiverem `CONCLUIDO`, atualizar frontmatter do plano para:

```yaml
status: "CONCLUIDO"
closed_at: "<timestamp ISO 8601>"
closed_by: "<executedBy>"
```

2. Se houver tasks em `FALHA` ou bloqueadas, manter status do plano em `APROVADO`.

> Nunca alterar conteúdo do plano fora do frontmatter, exceto se houver seção explícita de histórico operacional.

---

## Regras de execução obrigatórias

- Executar **somente** tasks com `status: PENDENTE`.
- Cada task deve ser executada via **subagent**.
- Com `agentDomain` informado, executar **somente** tasks do domínio.
- Não sobrescrever tasks já `CONCLUIDO`.
- Em `dryRun=true`, não persistir mudanças; apenas relatar o que seria feito.
- Não criar escopo novo fora do plano/task.

---

## Saída final obrigatória

Exibir relatório no formato:

```text
✅ EXECUÇÃO DO PLANO <plan_id>

Resumo:
- Domínio aplicado: <agentDomain ou TODOS>
- Tarefas pendentes encontradas: <N>
- Tarefas executadas com sucesso: <N>
- Tarefas com falha: <N>
- Tarefas bloqueadas por dependência: <N>
- Modo simulação: <true/false>

Arquivos de task atualizados:
- <lista>

Status final do plano:
- <APROVADO ou CONCLUIDO>

Pendências:
- <lista de task_id bloqueadas/falhas e motivo>
```

Se execução bloqueada no gate de aprovação, retornar:

```text
⛔ Execução bloqueada: plano não aprovado ou metadados de aprovação inválidos.
Ação necessária: aprovar o plano com `plan-approve.prompt.md` e garantir `approval.approved_by` preenchido.
```
