# SKILL-PG — Skills do Governador de Prompts

> Documento de referência para o agente **Governador de Prompts** (`.github/agents/governador-prompts.md`).
> Carregar este arquivo antes de executar qualquer skill PG.

---

## SKILL-PG-01 — Prompt Taxonomy Classifier

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Qualquer pedido de classificação, inventário ou auditoria de tipo de prompt |
| **Input** | Um arquivo, uma lista de arquivos, ou um diretório de artefatos de prompt |
| **Processamento** | 1. Lê localização canônica do arquivo → determina tipo primário candidato; 2. Lê primeiras linhas para verificar frontmatter existente (campo `type`); 3. Cruza com regras de taxonomia (tabela do system prompt); 4. Para ambiguidades: considera conteúdo e convenção de nomenclatura; 5. Escalona ao usuário se tipo ainda não determinável |
| **Output** | Tabela: `arquivo` \| `tipo detectado` \| `conformidade de localização` \| `frontmatter existente?` \| `ação recomendada` |
| **Autonomia de bloqueio** | Escala ao usuário se tipo não determinável; nunca classifica com `?` silenciosamente |
| **Regra crítica** | Consultar sempre o documento `prompt-taxonomy.md` quando publicado (T02 do PLAN-20260306-001); até a publicação, usar taxonomia embutida no system prompt |

### Regras de Classificação por Localização

| Localização | Tipo inferido | Exceção |
|-------------|---------------|---------|
| `.github/agents/*.md` | `system-prompt` | — |
| `.github/instructions/*.instructions.md` | `instruction` | — |
| `.github/*.md` (ex: `copilot-instructions.md`) | `instruction` | Verificar conteúdo |
| `.github/prompts/*.prompt.md` | `task-prompt` | — |
| `agents-engine/src/**/prompts/*.txt` | `runtime-prompt` | — |
| `agents-engine/src/**/prompts/*.md` | `runtime-prompt` | Verificar se é template de instrução |

---

## SKILL-PG-02 — Frontmatter Schema Applicator

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de aplicação ou correção de frontmatter em prompt(s) específico(s) ou em lote |
| **Input** | Arquivo(s) classificado(s) pela SKILL-PG-01 com tipo confirmado |
| **Processamento** | 1. Seleciona o schema YAML correto para o tipo do artefato; 2. Verifica se o arquivo já possui frontmatter; 3a. Sem frontmatter: insere o schema no início do arquivo com campos preenchidos; 3b. Com frontmatter: valida campos obrigatórios → corrige ausentes ou incorretos; 4. Vale a regra: `sha256: ""` sempre vazio; 5. Executa validação YAML sintaticamente antes de apresentar a edição ao usuário |
| **Output** | Arquivo(s) editado(s) com frontmatter válido + relatório: `arquivo` \| `ação` \| `campos adicionados` \| `campos corrigidos` |
| **Batch behavior** | Lotes > 10 arquivos: processar em grupos de 10, apresentar relatório parcial antes de continuar para o próximo grupo |
| **Proteção** | NUNCA sobrescreve frontmatter existente com perda de informação sem confirmação. Se campo existente tem valor e o schema requer um diferente, apresenta o conflito ao usuário |

### Schemas Canônicos por Tipo

#### Schema `system-prompt`
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

#### Schema `instruction`
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

#### Schema `task-prompt`
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

#### Schema `runtime-prompt`
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

---

## SKILL-PG-03 — Prompt Ownership Auditor

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de auditoria de owners, revisão de SLA ou designação de responsáveis |
| **Input** | Inventário de prompts classificados (SKILL-PG-01) + critérios de ownership do PROC-010 (quando publicado) |
| **Processamento** | 1. Para cada prompt: lê campo `owner` e `related_proc` do frontmatter; 2. Cruza com tabela de ownership natural por família de prompt; 3. Identifica prompts sem owner, com owner incorreto ou sem SLA; 4. Gera recomendações de designação |
| **Output** | Relatório: `arquivo` \| `tipo` \| `owner atual` \| `owner recomendado` \| `família` \| `SLA aplicável` \| `conformidade` |
| **Autonomia** | Recomenda ações — NUNCA designa owner sem confirmação explícita do usuário (designação de responsabilidade é decisão humana) |

### Tabela de Ownership Natural

| Família de prompt | Owner natural |
|-------------------|---------------|
| `system-prompt` (todos) | `tech-lead` |
| `di-brief-*`, `di-uc-*`, `di-critique-*` | `analista-negocios` |
| `di-ux-*`, `di-prototipar-*`, `di-refinar-prototipo*` | `ux-engineer` |
| `di-compliance-*`, `di-audit-*`, `di-doc-processo` | `gestor-processos` |
| `plan-*`, `scaffold-*`, `di-setup-*` | `arquiteto-corporativo` |
| `di-full-cycle` | `gestor-processos` |
| `commit-manager` | `tech-lead` |
| `di-prompt-*` | `tech-lead` |
| `di-behavioral-*` | `tech-lead` |

### SLAs de Manutenção Recomendados

| Tipo | SLA de revisão |
|------|----------------|
| `system-prompt` | A cada alteração de scope do agente ou semestral |
| `instruction` | Semestral ou a cada release major |
| `task-prompt` | Trimestral ou a cada alteração do processo associado |
| `runtime-prompt` | A cada alteração do skill Python que o injeta |
