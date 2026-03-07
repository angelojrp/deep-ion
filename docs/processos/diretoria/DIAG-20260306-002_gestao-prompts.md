---
doc_id: DIAG-20260306-002
tipo: Diagnóstico Estratégico
titulo: "GAP Crítico — Gestão de Prompts da Fábrica deep-ion"
origem: DIAG-20260306-001 (G-02)
emitido_em: "2026-03-06"
emitido_por: "Diretor de Processos"
status: EMITIDO
---

# Diagnóstico Estratégico — GAP Crítico: Gestão de Prompts

## Contexto Analisado

Foram lidos os seguintes artefatos:

- `.github/arquiteto-instructions.md` — instrução global auto-carregada em todos os agentes
- `.github/instructions/process-governance.instructions.md` — instrução de domínio scoped
- `.github/agents/arquiteto-corporativo.md` — system prompt do Arquiteto Corporativo
- `.github/agents/analista-negocios.md` — system prompt do Analista de Negócios
- `.github/agents/diretor-processos.md` — system prompt do Diretor de Processos
- `.github/agents/gestor-processos.md` — system prompt do Gestor de Processos
- `.github/agents/ux-engineer.md` — system prompt do UX Engineer
- `.github/agents/validador-ux.md` — system prompt do Validador UX
- `.github/prompts/` — 32 arquivos `.prompt.md` (prompts de tarefa/workflow)
- `architecture/skills/SKILL-agentes.md` — especificação dos agentes DOM-01..DOM-05b
- `DIAG-20260306-001_maturidade-global-processos.md` — diagnóstico estratégico global

---

## Inventário Atual de Artefatos de Prompt

A fábrica possui atualmente **40 artefatos de prompt** distribuídos em quatro categorias:

### Categoria 1 — System Prompts de Agentes VS Code (6 arquivos)
Localização: `.github/agents/`

| Arquivo | Agente | Propósito |
|---------|--------|-----------|
| `arquiteto-corporativo.md` | Arquiteto Corporativo | Produzir planos de execução arquiteturais |
| `analista-negocios.md` | Analista de Negócios | Governar ciclo de requisitos negociais |
| `diretor-processos.md` | Diretor de Processos | Diagnóstico estratégico e planos de evolução |
| `gestor-processos.md` | Gestor de Processos | Operação e auditoria de conformidade |
| `ux-engineer.md` | UX Engineer | Codificação de componentes frontend |
| `validador-ux.md` | Validador UX | Auditoria do sub-pipeline DOM-04-UX |

> ⚠️ **Estes arquivos são os "cérebros" dos agentes.** Uma alteração silenciosa muda o comportamento de toda a fábrica sem qualquer rastreabilidade.

### Categoria 2 — Instrução Global (1 arquivo)
Localização: `.github/`

| Arquivo | Escopo | Propósito |
|---------|--------|-----------|
| `arquiteto-instructions.md` | Todos os agentes (auto-carregado) | Contexto estrutural do repositório |

> ⚠️ **Carregado em TODOS os agentes automaticamente.** Nenhum agente sabe qual versão desse arquivo está em uso durante uma sessão em andamento.

### Categoria 3 — Instruções de Domínio Scoped (1 arquivo)
Localização: `.github/instructions/`

| Arquivo | applyTo | Propósito |
|---------|---------|-----------|
| `process-governance.instructions.md` | `architecture/plans/**` | Regras de ciclo de vida para planos |

### Categoria 4 — Prompts de Tarefa/Workflow (32 arquivos)
Localização: `.github/prompts/`

| Família | Prompts | Propósito |
|---------|---------|-----------|
| `di-brief-*` (2) | `di-brief-new`, `di-brief-refine` | Criação e refinamento de briefs |
| `di-uc-*` (3) | `di-uc-new`, `di-uc-update`, `di-uc-exec` | Gestão de casos de uso |
| `di-ux-*` (7) | page, mock, component, refactor, validar-spec, validar-prompts, validar-completo | Workflow UX end-to-end |
| `di-critique-*` (1) | `di-critique-us` | Crítica de user stories |
| `di-refine-*` (2) | `di-refine-us`, `di-refinar-prototipo-ux` | Refinamento de artefatos |
| `di-prioritize-*` (1) | `di-prioritize-us` | Priorização de user stories |
| `di-split-*` (1) | `di-split-us` | Decomposição de user stories |
| `di-compliance-*` (1) | `di-compliance-ciclo` | Verificação de conformidade do ciclo |
| `di-audit-*` (1) | `di-audit-processo` | Auditoria de processo |
| `di-doc-*` (1) | `di-doc-processo` | Documentação de processo |
| `di-*` (outros) | visao-projeto, refinar-visao-projeto, prototipar, full-cycle, exportar-tema, setup-dev-resources | Workflows gerais |
| `plan-*` (3) | plan-approve, plan-execute-approved, plan-frontendReactSpaScaffold | Gestão de planos |
| `scaffold-*` (2) | scaffold-modulo | Scaffolding de módulos |
| `commit-manager` (1) | commit-manager | Gestão de commits |
| `process-gap-report` (1) | process-gap-report | Relatório de GAPs |

### Categoria 5 — Prompts Planejados Ainda Inexistentes (referenciados, não criados)
Referenciados em `validador-ux.md`:

| Path Esperado | Status |
|---------------|--------|
| `src/deep_ion/dom_04_frontend/prompts/ux_analysis_v1.txt` | ❌ Não existe |
| `src/deep_ion/dom_04_frontend/prompts/ux_prototype_v1.txt` | ❌ Não existe |
| `src/deep_ion/dom_04_frontend/prompts/ux_component_v1.txt` | ❌ Não existe |

> ⚠️ **O Validador UX já referencia prompts que não foram criados.** A auditoria que ele deveria fazer não pode ser executada.

---

## Estado Atual

Os 40 artefatos de prompt existentes operam **sem qualquer governança formal**:

- **Sem versionamento semântico:** Não existe `v1.0.0`, `v1.1.0` nem changelog por artefato. O Git rastreia alterações de arquivo, mas não existe uma versão "de produção" designada por prompt.
- **Sem metadados estruturados:** Nenhum prompt possui: owner, data de criação, data de última revisão, agente consumidor, categoria, status (`draft`/`active`/`deprecated`).
- **Sem taxonomia:** Prompts de sistema, de instrução global, de instrução scoped e de workflow convivem sem distinção formal de categoria ou hierarquia.
- **Sem controle de mudança:** Qualquer desenvolvedor pode alterar um system prompt (`.github/agents/*.md`) com um commit sem nenhuma revisão ou gate — e a mudança entra em "produção" na próxima sessão de chat.
- **Sem registro de execução:** Nenhum artefato de audit (Issues, DecisionRecords, Audit Ledger) rastreia qual versão de qual prompt foi usada em cada execução de agente. **É impossível reproduzir exatamente o comportamento de uma sessão anterior.**
- **Sem política de deprecação:** Quando um prompt é alterado profundamente, a versão anterior desaparece. Não existe rollback documentado.
- **Sem teste de regressão comportamental:** Nenhum mecanismo verifica se uma alteração de prompt preserva o comportamento esperado (analogia: não há "golden tests" para prompts).

---

## Frameworks de Referência Aplicados

| Framework | Razão de Aplicação |
|-----------|--------------------|
| **CMMI L2/L3** | Verificação de se o processo de gestão de prompts é definido e rastreável |
| **ITIL v4 — Configuration Management** | Prompts são Configuration Items (CIs): devem ter versão, owner, baseline e CMDB |
| **Software Engineering — GitOps** | Artefatos de "código" (prompts) devem seguir os mesmos princípios de versionamento que código-fonte |
| **Lean — Muda de Conhecimento** | A ausência de versionamento de prompts cria desperdício quando comportamentos inesperados precisam ser investigados e não podem ser reproduzidos |
| **PMBOK — Risk Management** | Um prompt não versionado é um risco não mitigado: uma mudança acidental pode degradar toda a fábrica sem diagnóstico |

---

## GAPs Identificados

| # | GAP | Categoria | Impacto | Prioridade |
|---|-----|-----------|---------|------------|
| GP-01 | **System prompts sem versionamento** — os 6 arquivos `.github/agents/*.md` são o "código-fonte" do comportamento dos agentes, mas são editados como documentos simples sem semver, changelog ou gate de aprovação. Uma mudança de uma linha pode alterar radicalmente o comportamento de toda a fábrica. | Governança | Crítico | **P0** |
| GP-02 | **Ausência de metadados de rastreabilidade** — nenhum prompt possui frontmatter estruturado com: `version`, `owner`, `status`, `consumers`, `last_reviewed`, `hash`. Sem isso, não existe linha de base ("baseline de comportamento"). | Rastreabilidade | Crítico | **P0** |
| GP-03 | **Prompts de sistema e prompts de workflow misturados sem distinção formal** — os 6 system prompts de agente têm um impacto ordens de grandeza maior que os 32 prompts de workflow, mas não existe política diferenciada de controle para cada categoria. | Governança | Alto | **P1** |
| GP-04 | **Instrução global sem versionamento com impacto transversal** — `.github/arquiteto-instructions.md` é carregado em TODOS os agentes automaticamente. Sua modificação afeta simultaneamente todos os 6 agentes sem nenhum aviso ou controle. | Governança | Crítico | **P0** |
| GP-05 | **Prompts planejados do agents-engine inexistentes** — os 3 prompts Python referenciados em `validador-ux.md` não existem, tornando a auditoria do Validador UX inoperante. Isso também indica ausência de um processo de "prompt inception" (como um novo prompt nasce, é validado e entra em produção). | Ciclo de Vida | Alto | **P1** |
| GP-06 | **Nenhum artefato de execução registra o prompt utilizado** — o Audit Ledger e os DecisionRecords registram o que o agente decidiu, mas não a versão do prompt que guiou essa decisão. Isso torna investigações de comportamento inesperado inviáveis. | Rastreabilidade | Alto | **P1** |
| GP-07 | **Ausência de hash de prompt no Audit Ledger** — mesmo que uma "versão" fosse definida manualmente, sem um hash SHA-256 calculado no momento da execução, não há garantia de que o arquivo lido era idêntico ao que se acredita ter sido usado. | Integridade | Alto | **P1** |
| GP-08 | **Sem processo de revisão para alterações em prompts** — não existe gate, revisor designado ou critério de aprovação antes de uma alteração de system prompt entrar em uso. Contraste: o pipeline de código tem DOM-05b + PR Review, mas o pipeline de prompts tem zero controles. | Processo | Alto | **P1** |
| GP-09 | **32 prompts de workflow sem owner nem SLA de manutenção** — quando uma regra de processo muda (ex: novo gate no pipeline), não existe um responsável designado para revisar e atualizar os prompts de workflow impactados. A desatualização é invisível e silenciosa. | Manutenibilidade | Médio | **P2** |
| GP-10 | **Sem taxonomia formal de prompts** — a fábrica precisa distinguir ao menos 4 tipos: `system-prompt` (comportamento do agente), `instruction` (escopo automático por path), `task-prompt` (workflow de usuário), `runtime-prompt` (injetado programaticamente pelo agents-engine). Cada tipo requer governança diferente. | Taxonomia | Médio | **P2** |

---

## Análise de Risco por Cenário

### Cenário 1 — Alteração Acidental de System Prompt em Produção
**Probabilidade:** Alta (já ocorreu em praticamente todo projeto colaborativo com LLMs)
**Consequência:** O agente passa a se comportar diferente de forma sutil. O comportamento errado pode propagar por múltiplos artefatos antes de ser detectado. Como não há versão anterior registrada, o rollback requer investigação no histórico do Git sem nenhuma marcação de "versão em produção".

### Cenário 2 — Model Upgrade sem Regression Test de Prompt
**Probabilidade:** Certa (modelos evoluem continuamente)
**Consequência:** O mesmo prompt pode ter comportamento radicalmente diferente em Claude Sonnet 4.7 vs 4.6. Sem golden tests, a degradação de comportamento é descoberta somente em produção — ou nunca, se for sutil.

### Cenário 3 — Fábrica em Escala com Prompts Sem Owner
**Probabilidade:** Certa conforme a fábrica cresce
**Consequência:** O prompt `di-full-cycle.prompt.md` orquestra toda uma demanda de ponta-a-ponta. Se ficar desatualizado após uma mudança de pipeline, TODAS as demandas executadas por ele seguirão um fluxo incorreto silenciosamente.

### Cenário 4 — agents-engine em Python Sem Runtime Prompt Governance
**Probabilidade:** Iminente (o scaffold está sendo construído agora)
**Consequência:** Se o `agents-engine` nascer sem uma política clara para prompts Python (`ux_analysis_v1.txt`, etc.), os mesmos problemas de versionamento e rastreabilidade serão transplantados para a camada de execução programática — onde o impacto é ainda maior porque os prompts são injetados automaticamente sem intervenção humana.

---

## Recomendações Estratégicas

**R-01 — Estabelecer Taxonomia de 4 Tipos de Prompt** *(P1 — endereça GP-10)*
Definir formalmente os 4 tipos: `system-prompt`, `instruction`, `task-prompt`, `runtime-prompt`. Cada tipo terá políticas de controle diferenciadas. System prompts e runtime prompts exigem controle mais rígido que task-prompts.

**R-02 — Adicionar frontmatter de governança a todos os prompts existentes** *(P1 — endereça GP-02)*
Definir um esquema de frontmatter obrigatório para cada tipo de prompt:

```yaml
# Para system-prompts (.github/agents/*.md)
---
prompt_id: SP-arquiteto-corporativo
version: 1.0.0
type: system-prompt
owner: tech-lead
consumers: [arquiteto-corporativo-agent]
status: active  # draft | active | deprecated
last_reviewed: "2026-03-06"
sha256: "<hash calculado no momento do merge>"
---
```

```yaml
# Para task-prompts (.github/prompts/*.prompt.md)
---
prompt_id: TP-brief-new
version: 1.2.0
type: task-prompt
owner: analista-negocios
consumers: [analista-negocios-agent]
status: active
last_reviewed: "2026-03-06"
related_proc: PROC-001
---
```

**R-03 — Implementar Gate de Revisão para System Prompts** *(P0 — endereça GP-01, GP-08)*
Toda alteração em `.github/agents/*.md` ou `.github/arquiteto-instructions.md` (os 7 arquivos mais críticos) deve exigir:
- PR com pelo menos 1 revisor humano (Tech Lead ou PO)
- Descrição da mudança com justificativa comportamental
- Referência ao risco de regressão
- Atualização do campo `version` e `sha256` no frontmatter

(Implementação via `CODEOWNERS` no `.github/CODEOWNERS` — baixo custo operacional.)

**R-04 — Registrar hash do prompt usado em cada execução de agente** *(P1 — endereça GP-06, GP-07)*
O `agents-engine` deve calcular e registrar o SHA-256 de cada arquivo de prompt carregado no início de uma sessão. Esse hash deve compor o `DecisionRecord` e a entrada do Audit Ledger. Isso habilita reprodutibilidade e auditoria retroativa.

**R-05 — Criar suite de Behavioral Regression Tests para system prompts** *(P1 — endereça GP-01, GP-08)*
Para os 6 agentes mais críticos, definir 3–5 "golden cases": input de exemplo → output esperado (estrutura, não conteúdo literal). A suite deve ser executada antes de qualquer merge em system prompt. Ferramenta sugerida: teste unitário Python com mock do LLM ou eval com critério baseado em schema.

**R-06 — Criar processo formal de "Prompt Inception"** *(P1 — endereça GP-05)*
Documentar como um novo prompt nasce: `DRAFT` → revisão por owner do agente consumidor → `ACTIVE`. Sem esse gate, os 3 prompts Python planejados para o `agents-engine` nascerão no mesmo estado caótico que os existentes.

**R-07 — Designar owners e criar SLA de manutenção para task-prompts** *(P2 — endereça GP-09)*
Para cada um dos 32 task-prompts, designar um owner (pode ser o mesmo agente que o consome) e definir que toda mudança de pipeline ou processo dispara uma revisão dos prompts impactados dentro de 1 sprint.

---

## Plano de Evolução — Gestão de Prompts

```
FASE 0 — Contenção Imediata (esta semana — endereça GP-01, GP-04)
  └── R-03: Adicionar CODEOWNERS para .github/agents/* e .github/arquiteto-instructions.md
       Custo: 1 arquivo, 10 minutos. Impacto: zero alterações não revisadas em produção.

FASE 1 — Fundação de Governança (≤ 1 sprint)
  ├── R-01: Definir taxonomia formal dos 4 tipos de prompt
  ├── R-02: Adicionar frontmatter de governança aos 40 prompts existentes (em batch)
  └── R-06: Documentar processo formal de Prompt Inception

FASE 2 — Rastreabilidade e Auditoria (≤ 2 sprints)
  ├── R-04: Hash de prompt no Audit Ledger (integração no agents-engine)
  └── R-05: Behavioral Regression Test suite para os 6 system prompts

FASE 3 — Manutenibilidade Contínua (≤ 1 sprint)
  └── R-07: Owners + SLA de manutenção para 32 task-prompts
```

---

## Maturidade Atual vs. Alvo

| Dimensão | Nível Atual | Evidência | Nível Alvo | Delta |
|----------|------------|-----------|------------|-------|
| Versionamento de prompts | **L1 — Inexistente** | Nenhum semver em nenhum dos 40 artefatos | L3 — Versionado e rastreável | Crítico |
| Controle de mudança em system prompts | **L1 — Inexistente** | Qualquer commit altera produção | L3 — Gate com revisor obrigatório | Crítico |
| Taxonomia de tipos de prompt | **L1 — Inexistente** | 4 tipos misturados sem distinção | L3 — Taxonomia definida e aplicada | Alto |
| Rastreabilidade de execução | **L1 — Inexistente** | Audit Ledger não registra versão do prompt | L3 — Hash registrado por execução | Alto |
| Testes de regressão comportamental | **L1 — Inexistente** | Zero golden tests | L3 — Suite automatizada por agente | Alto |
| Processo de Prompt Inception | **L1 — Inexistente** | Prompts nascem sem gate formal | L2 — Processo documentado | Médio |

---

## Justificativa de Prioridade Máxima

**Por que Gestão de Prompts deve ser o PRIMEIRO GAP a ser endereçado na fábrica:**

1. **Os prompts existem agora e já estão sem governança.** Ao contrário do GAP de Engenharia de Contexto (que afeta agentes ainda a serem implementados), os 40 prompts já estão em uso operacional diário — gerando risco em cada sessão de chat.

2. **A FASE 0 tem custo praticamente zero.** Adicionar `CODEOWNERS` leva 10 minutos e imediatamente elimina o risco de alteração silenciosa de system prompt. É o quick-win de maior impacto/custo da fábrica.

3. **Resolver este GAP cria a infraestrutura que o GAP de Engenharia de Contexto precisa.** Um `ContextPacket` formal (DIAG-20260306-003, R-01) precisa referenciar versões de prompts específicas para ser reprodutível. Se os prompts não têm versão, o ContextPacket não pode ser especificado com precisão.

4. **O `agents-engine` está sendo scaffoldado agora.** Este é o momento ideal para definir como os runtime-prompts Python (os 3 inexistentes + todos os futuros) devem nascer, desde o início — antes de haver dívida técnica de prompt acumulada na camada programática.
