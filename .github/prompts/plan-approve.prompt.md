---
mode: agent
description: "Revisa, aprova ou rejeita um plano de execução em architecture/plans/ e extrai as tarefas em arquivos independentes."
tools:
  - codebase
  - editFiles
  - search
---

Assuma o papel de **Arquiteto Corporativo** responsável pela governança de planos da Fábrica de Software Autônoma.

---

## Parâmetros de entrada

| Campo | Valor |
|-------|-------|
| **Caminho do plano** | `${input:planPath:Caminho relativo ao arquivo .md do plano (ex: architecture/plans/PLAN-20260304-001_agents-engine-scaffold/PLAN-20260304-001_agents-engine-scaffold.md)}` |
| **Decisão** | `${input:decision:Decisão de aprovação: APROVADO ou REJEITADO}` |
| **Aprovado por** | `${input:approvedBy:Nome completo do responsável pela aprovação}` |
| **Motivo da rejeição** | `${input:rejectionReason:Motivo da rejeição (obrigatório se REJEITADO, deixe vazio se APROVADO)}` |

---

## Passo 1 — Leitura e validação do plano

1. Ler o arquivo informado em `planPath`.
2. Verificar que o frontmatter YAML contém os campos obrigatórios:
   - `plan_id`, `title`, `status`, `approval.approved_by`.
3. Verificar que `status` atual é **`PENDENTE`**.
   - Se `status == APROVADO` → **bloquear**: plano já foi aprovado anteriormente. Informar ao usuário e encerrar.
   - Se `status == REJEITADO` → **bloquear**: plano já foi rejeitado. Informar ao usuário e encerrar.
   - Se campo ausente ou valor inválido → **bloquear**: orientar a corrigir o frontmatter conforme `architecture/plans/_TEMPLATE.md`.

---

## Passo 2 — Exibição do resumo para revisão

Antes de aplicar qualquer alteração, apresentar ao usuário o resumo do plano no seguinte formato:

```
📋 PLANO: <plan_id> — <title>
   Classificação: <classification>
   Criado por:    <created_by> em <created_at>
   Status atual:  <status>

   Tarefas:
   <lista numerada com # | título | agente | depende de>

   Riscos identificados:
   <lista de riscos do plano>
```

---

## Passo 3 — Atualização dos metadados

Com base na `decision` informada, atualizar **somente o bloco frontmatter** do arquivo do plano:

### Se `decision == APROVADO`

Substituir no frontmatter:
```yaml
status: "APROVADO"
approval:
  approved_by: "<approvedBy>"
  approved_at: "<timestamp ISO 8601 do momento atual>"
  rejection_reason: ""
```

### Se `decision == REJEITADO`

- Validar que `rejectionReason` não está vazio — se estiver, **bloquear** e solicitar o motivo antes de prosseguir.

Substituir no frontmatter:
```yaml
status: "REJEITADO"
approval:
  approved_by: "<approvedBy>"
  approved_at: "<timestamp ISO 8601 do momento atual>"
  rejection_reason: "<rejectionReason>"
```

> ⚠️ Não modificar nenhuma outra seção do arquivo do plano.

---

## Passo 4 — Extração de tarefas (somente se `decision == APROVADO`)

### 4.1 Verificar se as tarefas já foram extraídas

Verificar se existe o diretório `tasks/` no mesmo diretório do arquivo do plano.

- **Se `tasks/` já existe e contém arquivos `.md`** → pular este passo e informar que as tarefas já estão extraídas.
- **Se `tasks/` não existe ou está vazio** → prosseguir com a extração abaixo.

### 4.2 Identificar e extrair as tarefas

Para cada linha da tabela de tarefas no plano (seção `### Tarefas`):

1. Extrair os campos: `task_id` (T01…TNN), `slug` do nome do arquivo, `agent`, `depends_on`, `parallel_with`, `model`.
2. Criar o arquivo `tasks/<arquivo_da_tarefa>` conforme indicado na coluna "Arquivo da tarefa" da tabela.

### 4.3 Conteúdo de cada arquivo de tarefa

Cada arquivo de tarefa deve ser criado seguindo **exatamente** o template abaixo, preenchendo com as informações disponíveis no plano pai:

```markdown
---
plan_id: <plan_id>
task_id: <TXX>
title: "<título descritivo extraído ou inferido do contexto do plano>"
agent: <agente da tabela>
model: <modelo da tabela>
status: PENDENTE
depends_on: [<lista de IDs ou vazio []>]
parallel_with: [<lista de IDs ou vazio []>]
---

## Tarefa <TXX> — `<nome do artefato>`

**Plano pai:** [<plan_id>](<../nome-do-arquivo-indice.md>)
**Agente executor:** <agente>
**Modelo sugerido:** `<modelo>` — <justificativa de escolha do modelo, se disponível>
**Depende de:** <T0X ou —>
**Paralelo com:** <T0X, T0Y ou —>

---

### Objetivo

<Extrair do contexto do plano a descrição do que esta tarefa deve produzir.
Se não houver detalhes suficientes no plano, usar: "Ver plano pai para detalhamento completo.">

---

### Contexto de Blueprint

<Copiar do plano pai as referências de blueprint, pacote base e módulo alvo relevantes para esta tarefa.>

---

### Especificação Técnica

<!-- A ser detalhada pelo agente executor com base no blueprint referenciado -->

---

### Riscos Específicos

<Extrair do plano pai apenas os riscos (R0…RN) relevantes para esta tarefa específica.
Se nenhum risco for específico desta tarefa, usar: "— Sem riscos específicos identificados além dos listados no plano pai.">

---

### Artefatos de Saída

<!-- A ser preenchido pelo agente executor -->

---

### Critérios de Aceite

<!-- A ser preenchido pelo agente executor -->
```

### 4.4 Atualizar o índice do plano

Após criar todos os arquivos de tarefa, verificar se a tabela de tarefas no índice já contém links relativos para os arquivos `tasks/`. Se não contiver, atualizar cada linha para incluir o link no formato:

```markdown
[PLAN-{ID}_TXX_<slug>.md](tasks/PLAN-{ID}_TXX_<slug>.md)
```

---

## Passo 5 — Confirmação final

Ao concluir, exibir o relatório de execução:

```
✅ PLANO <plan_id> — <decision>

Metadados atualizados:
  • status: <novo status>
  • approved_by: <approvedBy>
  • approved_at: <timestamp>
  <• rejection_reason: <motivo> (somente se REJEITADO)>

<Se APROVADO e tarefas extraídas:>
Tarefas extraídas para tasks/:
  • <lista de arquivos criados>

<Se APROVADO e tarefas já existiam:>
ℹ️  Diretório tasks/ já continha arquivos — nenhuma extração necessária.

<Se REJEITADO:>
⛔ Plano rejeitado. Nenhum arquivo de tarefa foi criado ou modificado.
```

---

## Regras de governança

- **Nunca** iniciar extração de tarefas se o plano for rejeitado.
- **Nunca** modificar o conteúdo (fora do frontmatter) do arquivo de índice, exceto para adicionar links na tabela de tarefas (Passo 4.4).
- **Nunca** recriar ou sobrescrever arquivos de tarefa já existentes em `tasks/`.
- O campo `approval.approved_by` é **obrigatório** — recusar qualquer aprovação com este campo vazio.
- O timestamp em `approved_at` deve usar o horário atual no formato ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`).
