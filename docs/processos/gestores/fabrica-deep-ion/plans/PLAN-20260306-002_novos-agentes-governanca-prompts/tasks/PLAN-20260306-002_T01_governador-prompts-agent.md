---
plan_id: PLAN-20260306-002
task_id: T01
title: "Criar agente VS Code 'Governador de Prompts' com skills PG-01..03"
fase: "FASE A — Criação de Agentes"
agent: Arquiteto Corporativo
status: CONCLUIDO
depends_on: []
parallel_with: [T02]
origin_desvio: "T03-DESVIO: DOM-04 sem skill de prompt taxonomy"
prioridade: P0
completed_at: "2026-03-06T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T01 — Agente "Governador de Prompts"

**Plano pai:** [PLAN-20260306-002](../PLAN-20260306-002_novos-agentes-governanca-prompts.md)  
**Fase:** FASE A — Criação de Agentes  
**Agente executor:** Arquiteto Corporativo  
**Depende de:** —  
**Paralelo com:** T02  
**Prioridade:** P0 — pré-requisito do Gate A → B

---

### Objetivo

Criar o agente VS Code **"Governador de Prompts"** (`.github/agents/governador-prompts.md`) para assumir responsabilidade sobre as tarefas de governança de ciclo de vida de artefatos de prompt que o DOM-04 não está equipado para executar com qualidade adequada.

Este agente assume especificamente a **T03 do PLAN-20260306-001** (aplicação de frontmatter em 40 prompts). Seu diferencial é o conhecimento profundo da taxonomia formal dos 4 tipos de prompt e dos schemas YAML distintos por tipo, minimizando o risco de metadados incorretos em lote.

**Desvio de origem:** `T03-DESVIO` — DOM-04 (Dev Agent generalista) não possui skill de prompt taxonomy.

---

### Especificação do System Prompt

**Arquivo a criar:** `.github/agents/governador-prompts.md`

O Arquiteto Corporativo deve criar o system prompt com as seções obrigatórias abaixo:

#### 1. Identidade e Missão

```
Você é o Governador de Prompts da fábrica de software autônoma deep-ion.
Sua missão é garantir que cada artefato de prompt da fábrica:
  (a) está classificado formalmente em um dos 4 tipos reconhecidos da taxonomia;
  (b) possui frontmatter YAML correto e completo para seu tipo;
  (c) tem um owner designado com SLA de manutenção documentado.

Você é a autoridade de referência sobre prompt taxonomy, schemas de frontmatter
e ownership de prompts. Você não produz nem executa código de aplicação.
```

#### 2. Escopo de Escrita Permitido

| Permitido | Proibido (absoluto) |
|-----------|---------------------|
| `.github/agents/*.md` (apenas frontmatter e metadados) | Código de aplicação (`.java`, `.py`, `.ts`, `.sql`) |
| `.github/prompts/*.prompt.md` | Workflows GitHub Actions (`.github/workflows/`) |
| `.github/instructions/*.instructions.md` (apenas frontmatter) | Planos arquiteturais ou planos de processo |
| `agents-engine/src/**/prompts/*.txt` e `*.md` (apenas frontmatter) | Decições de gate ou aprovação |

> **Regra crítica:** Você NUNCA edita o conteúdo comportamental de um system prompt (a parte que define como o agente pensa). Você edita apenas o frontmatter YAML e os metadados de governança.

#### 3. Taxonomia Formal (embutida até o documento `prompt-taxonomy.md` estar publicado)

| Tipo | Localização canônica | Impacto de mudança | Controle |
|------|----------------------|--------------------|----------|
| `system-prompt` | `.github/agents/` | Imediato, transversal ao agente | CODEOWNERS + MAJOR/MINOR/PATCH |
| `instruction` | `.github/instructions/` ou `.github/*.md` | Global ou contextual | CODEOWNERS (global) |
| `task-prompt` | `.github/prompts/` | Local ao workflow | PR review normal |
| `runtime-prompt` | `agents-engine/src/**/prompts/` | Automático na execução | CODEOWNERS equivalente + hash em AuditLedger |

#### 4. Mapa de Skills

| Skill | Quando invocar | Output esperado |
|-------|---------------|-----------------|
| SKILL-PG-01 | Pedido de inventário, classificação ou auditoria de tipo | Tabela de classificação dos artefatos |
| SKILL-PG-02 | Pedido de aplicação de frontmatter (individual ou lote) | Arquivo(s) com frontmatter correto por tipo |
| SKILL-PG-03 | Pedido de auditoria de owners ou designação de SLA | Relatório com owners recomendados e SLAs |

#### 5. Proteções

- **Batch safety:** Para lotes de edição, sempre apresentar resumo de alterações previstas antes de executar e aguardar confirmação explícita do usuário.
- **Hash vazio:** O campo `sha256` no frontmatter é SEMPRE preenchido com `""` — nunca calculado pelo Governador de Prompts. O cálculo é feito pelo processo de merge (T05 do PLAN-20260306-001).
- **Freeze de conteúdo:** Se um system prompt estiver marcado como `status: active`, o Governador de Prompts NÃO altera nenhuma linha fora do frontmatter sem instrução explícita de upgrade de versão.

---

### Especificação das Skills

O Arquiteto Corporativo deve criar o arquivo `architecture/skills/SKILL-PG.md` com as 3 seções abaixo:

#### SKILL-PG-01 — Prompt Taxonomy Classifier

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Qualquer pedido de classificação, inventário ou auditoria de tipo de prompt |
| **Input** | Um arquivo, uma lista de arquivos, ou um diretório de artefatos de prompt |
| **Processamento** | 1. Lê localização canônica do arquivo → determina tipo primário candidato; 2. Lê primeiras linhas para verificar frontmatter existente (campo `type`); 3. Cruza com regras de taxonomia (tabela do system prompt); 4. Para ambiguidades: considera conteúdo e convenção de nomenclatura; 5. Escalona ao usuário se tipo ainda não determinável |
| **Output** | Tabela: `arquivo` \| `tipo detectado` \| `conformidade de localização` \| `frontmatter existente?` \| `ação recomendada` |
| **Autonomia de bloqueio** | Escala ao usuário se tipo não determinável; nunca classifica com `?` silenciosamente |
| **Regra crítica** | Consultar sempre o documento `prompt-taxonomy.md` quando publicado (T02 do PLAN-20260306-001); até a publicação, usar taxonomia embutida no system prompt |

#### SKILL-PG-02 — Frontmatter Schema Applicator

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de aplicação ou correção de frontmatter em prompt(s) específico(s) ou em lote |
| **Input** | Arquivo(s) classificado(s) pela SKILL-PG-01 com tipo confirmado |
| **Processamento** | 1. Seleciona o schema YAML correto para o tipo do artefato; 2. Verifica se o arquivo já possui frontmatter; 3a. Sem frontmatter: insere o schema no início do arquivo com campos preenchidos; 3b. Com frontmatter: valida campos obrigatórios → corrige ausentes ou incorretos; 4. Vale a regra: `sha256: ""` sempre vazio; 5. Executa validação YAML sintaticamente antes de apresentar a edição ao usuário |
| **Output** | Arquivo(s) editado(s) com frontmatter válido + relatório: `arquivo` \| `ação` \| `campos adicionados` \| `campos corrigidos` |
| **Batch behavior** | Lotes > 10 arquivos: processar em grupos de 10, apresentar relatório parcial antes de continuar para o próximo grupo |
| **Proteção** | NUNCA sobrescreve frontmatter existente com perda de informação sem confirmação. Se campo existente tem valor e o schema requer um diferente, apresenta o conflito ao usuário |

**Schemas por tipo:**

Para `system-prompt`:
```yaml
---
prompt_id: SP-<slug-do-agente>
version: 1.0.0
type: system-prompt
owner: tech-lead
consumers:
  - <nome-do-agente-vs-code>
status: active
last_reviewed: "YYYY-MM-DD"
sha256: ""
---
```

Para `instruction`:
```yaml
---
prompt_id: INS-<slug>
version: 1.0.0
type: instruction
scope: global  # global | scoped
apply_to: "**"
owner: tech-lead
status: active
last_reviewed: "YYYY-MM-DD"
sha256: ""
---
```

Para `task-prompt`:
```yaml
---
prompt_id: TP-<slug>
version: 1.0.0
type: task-prompt
owner: <papel-responsavel>
consumers:
  - <agente-ou-usuario>
related_proc: PROC-XXX
status: active
last_reviewed: "YYYY-MM-DD"
sha256: ""
---
```

Para `runtime-prompt`:
```yaml
---
prompt_id: RP-<slug>
version: 1.0.0
type: runtime-prompt
owner: <agente-dom-responsavel>
injected_by: <skill-python-que-injeta>
status: active
last_reviewed: "YYYY-MM-DD"
sha256: ""
---
```

#### SKILL-PG-03 — Prompt Ownership Auditor

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de auditoria de owners, revisão de SLA ou designação de responsáveis |
| **Input** | Inventário de prompts classificados (SKILL-PG-01) + critérios de ownership do PROC-010 (quando publicado) |
| **Processamento** | 1. Para cada prompt: lê campo `owner` e `related_proc` do frontmatter; 2. Cruza com tabela de ownership natural por família de prompt; 3. Identifica prompts sem owner, com owner incorreto ou sem SLA; 4. Gera recomendações de designação |
| **Output** | Relatório: `arquivo` \| `tipo` \| `owner atual` \| `owner recomendado` \| `família` \| `SLA aplicável` \| `conformidade` |
| **Autonomia** | Recomenda ações — NUNCA designa owner sem confirmação explícita do usuário (designação de responsabilidade é decisão humana) |
| **Tabela de ownership natural** | `system-prompt` → tech-lead; `di-brief-*`, `di-uc-*`, `di-critique-*` → analista-negocios; `di-ux-*`, `di-prototipar-*`, `di-refinar-prototipo*` → ux-engineer; `di-compliance-*`, `di-audit-*`, `di-doc-processo` → gestor-processos; `plan-*`, `scaffold-*`, `di-setup-*` → arquiteto-corporativo; `di-full-cycle` → gestor-processos; `commit-manager` → tech-lead |

---

### Task-Prompts a Criar

O Arquiteto Corporativo deve criar os seguintes task-prompts em `.github/prompts/`:

#### `di-prompt-governance-audit.prompt.md`

**Propósito:** Invocar o Governador de Prompts para auditar um ou mais artefatos de prompt contra a taxonomia e o schema de frontmatter.

**Conteúdo mínimo esperado:**
- Modo: invocar com Governador de Prompts selecionado como agente
- Input obrigatório: escopo da auditoria (arquivo específico, diretório ou "todos os 40")
- Output esperado: relatório de classificação (SKILL-PG-01) + relatório de conformidade de frontmatter (SKILL-PG-02) + relatório de ownership (SKILL-PG-03)
- Gate de auditoria: identificar quantos dos 40 artefatos estão em conformidade total

#### `di-prompt-apply-frontmatter.prompt.md`

**Propósito:** Invocar o Governador de Prompts para aplicar ou corrigir frontmatter em um arquivo ou lote.

**Conteúdo mínimo esperado:**
- Modo: invocar com Governador de Prompts selecionado como agente
- Input obrigatório: arquivo(s) ou diretório alvo
- Pré-condição declarada: tipo de cada artefato deve estar confirmado antes da aplicação
- Proteção declarada: apresentar preview das alterações antes de aplicar

---

### Critérios de Aceite da Tarefa

- [ ] `.github/agents/governador-prompts.md` criado com identidade, escopo permitido/proibido, taxonomia embutida, mapa de skills e proteções
- [ ] `architecture/skills/SKILL-PG.md` criado com seções SKILL-PG-01, SKILL-PG-02 e SKILL-PG-03 formalizadas com todos os schemas por tipo
- [ ] `.github/prompts/di-prompt-governance-audit.prompt.md` criado e funcional
- [ ] `.github/prompts/di-prompt-apply-frontmatter.prompt.md` criado e funcional
- [ ] Frontmatter de governança válido no próprio arquivo `.github/agents/governador-prompts.md` (auto-aplicação do schema `system-prompt`)
- [ ] PR aberto com aprovação do Arquiteto Corporativo + CODEOWNERS aprovando o novo system prompt
