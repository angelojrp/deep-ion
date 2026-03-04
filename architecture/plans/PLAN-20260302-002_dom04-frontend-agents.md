---
plan_id: PLAN-20260302-002
title: "DOM-04 — Agentes Frontend em 3 Níveis de Senioridade (Junior / Pleno / Sênior)"
classification: T2
created_at: "2026-03-02T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: IMPLEMENTADO
approval:
  approved_by: "Angelo Pereira"
  approved_at: "02/03/2026"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

## Plano de Execução — DOM-04: Agentes Frontend em 3 Níveis de Senioridade

**Classificação de Impacto:** T2

---

### Contexto

O DOM-04 (Dev Agent) foi especificado para geração de código Java/Spring Boot.
O projeto `deep-ion` incorpora agora um módulo React 18 (ver PLAN-20260226-001),
tornando necessário expandir o DOM-04 com capacidade de geração de código frontend.

A demanda cria **três skills Python independentes** dentro do subpacote
`dom_04_frontend`, cada um representando um perfil de senioridade com restrições
distintas de complexidade de tarefa e de custo de modelo LLM:

| Agente | Slug | Complexidade das Tarefas | Restrição de Modelo |
|--------|------|--------------------------|---------------------|
| Junior | `skill_dev_fe_junior` | T0 — trivial | Apenas modelos baratos (`GPT-4o`) |
| Pleno  | `skill_dev_fe_pleno`  | T0 / T1 — baixa a média | Modelos intermediários (veda `Opus 4.6` e equivalentes de alto custo) |
| Sênior | `skill_dev_fe_senior` | T0 / T1 / T2 — até alta | Qualquer modelo, sem restrição de custo |

Um **Task Classifier** (`skill_dev_fe_classifier`) precede os três e roteia a tarefa
ao nível correto com base em critérios determinísticos + análise LLM supervisionada.

---

### Definições de Escopo por Nível

#### Junior — T0 (tarefas triviais, reversíveis, sem toque em regras de negócio)

Exemplos de tarefas elegíveis:
- Criar ou editar componente atômico isolado (Button, Badge, Spinner, Avatar)
- Corrigir chave de tradução (`i18n`) sem alterar estrutura de dados
- Ajustar classes Tailwind em componente existente (layout, cor, espaçamento)
- Adicionar validação de campo simples (required, minLength) a formulário existente
- Corrigir bug de renderização condicional em componente folha (sem lógica de estado global)
- Adicionar storybook entry para componente já implementado

Bloqueios automáticos para o Junior (roteiam para Pleno ou Sênior):
- Qualquer arquivo nos diretórios `application/`, `infrastructure/` ou `domain/`
- Criação de novo custom hook
- Integração com camada de API client
- Qualquer mudança em `AppRouter.tsx`, `ProtectedRoute.tsx` ou fluxo de autenticação
- Presença das palavras `auth`, `token`, `LGPD`, `CPF`, `saldo` na descrição da tarefa

#### Pleno — T0 / T1 (complexidade baixa a média, pode tocar application layer)

Exemplos de tarefas elegíveis:
- Implementar página completa de feature com componentes + hook + chamada de API
- Criar custom hook com lógica de estado local (`useState`, `useReducer`)
- Implementar integração com TanStack Query (query + mutation) para um endpoint
- Criar use case na camada `application/use-cases/`
- Implementar tratamento de erro visual para FEs determinísticos (ex: `SaldoInsuficiente`)
- Refatorar componente de médio porte para separar apresentação de lógica

Bloqueios automáticos para o Pleno (roteiam para Sênior):
- Mudanças na configuração de autenticação/autorização OAuth2 + PKCE
- Criação de novo módulo de domínio completo (pasta + rotas + hooks + pages)
- Mudanças em `AppRouter.tsx` que afetam mais de 2 rotas
- Qualquer mudança que envolva dados pessoais LGPD sem revisão humana explícita
- Otimizações de performance global (lazy loading, code splitting, bundle analysis)
- Score de complexidade front-end ≥ 4.6 (calculado pelo Task Classifier)

#### Sênior — T0 / T1 / T2 (alta complexidade, decisões arquiteturais frontend)

Exemplos de tarefas elegíveis:
- Implementar módulo de domínio frontend novo do zero (ex: módulo `relatorio`)
- Configurar ou alterar fluxo OAuth2 Authorization Code + PKCE
- Implementar funcionalidades com requisitos LGPD (mascaramento, consentimento)
- Migração de versão de dependência crítica (React, TanStack Query, Tailwind)
- Implementar estratégia global de tratamento de erro (ErrorBoundary hierárquico)
- Auditoria e correção de acessibilidade (WCAG 2.1 AA)
- Configuração de CI/CD, otimização de bundle, análise de performance (Lighthouse)

> **T3 — Tarefas Totalmente Assistidas:** O Sênior pode atuar como acelerador de
> análise em demandas T3, mas **nenhuma etapa é autônoma**. O plano de tarefa T3
> deve obter aprovação humana explícita antes de qualquer geração de código.

---

### Matriz de Modelos LLM por Nível

| Nível  | Modelos Permitidos | Modelos Proibidos | Modelo Padrão |
|--------|--------------------|-------------------|---------------|
| Junior | `GPT-4o` | Qualquer modelo fora desta lista | `GPT-4o` |
| Pleno  | `GPT-4o`, `GPT-4.1`, `GPT-5.1-Codex` | `Claude Opus 4.6` e modelos equivalentes de alto custo | `GPT-5.1-Codex` |
| Sênior | Qualquer modelo disponível no provider | — | `Claude Opus 4.6` |

A restrição de modelos é **hard-coded** na `ModelBudgetPolicy` (camada `domain/`) de cada
skill. O skill não consulta `AI_PROVIDER` para isso — a política é determinística e
imutável em tempo de execução. Sobrescrita requer alteração de código + revisão T2.

---

### Política de Output — Non-Verbose (Redução de Tokens)

Todos os agentes Frontend **operam exclusivamente em modo `execution_only`**, alinhado ao
campo `llm_behavior.default_mode: execution_only` definido no blueprint `python-agent-first.yaml`.

**Regras obrigatórias para os 3 skills (Junior, Pleno, Sênior):**

| Regra | Descrição |
|-------|-----------|
| **NV-01** | O LLM **nunca** deve incluir explicações, comentários narrativos ou justificativas no output de geração de código. |
| **NV-02** | A resposta do LLM deve conter **exclusivamente blocos de código** (um bloco por arquivo), sem texto antes ou depois. |
| **NV-03** | Comentários inline no código gerado são permitidos **apenas quando semanticamente necessários** (ex: `// RN-01` em validação de saldo) — comentários explicativos do que o bloco faz são proibidos. |
| **NV-04** | O PR aberto pelo agente **não deve ter body descritivo gerado por LLM**. O body é preenchido com template estático (título + link da issue + checklist mínimo hardcoded no skill). |
| **NV-05** | GitHub comments publicados pelo agente limitam-se ao `DecisionRecord` JSON estruturado — sem prosa adicional. |
| **NV-06** | O prompt de cada skill deve instruir explicitamente: _"Respond with code blocks only. No explanations. No prose. No markdown outside of code fences."_ |

**Implementação:**
- `OutputPolicy` (enum + validator) deve residir em `domain/output_policy.py` e ser injetada em todos os skills.
- Pós-processamento obrigatório: antes de qualquer commit, o skill executa `OutputPolicy.strip_prose(llm_response)` que remove qualquer linha fora de blocos de código delimitados por ` ``` `. Se após o strip o resultado estiver vazio → falha detalhada no `DecisionRecord`, não gera commit.
- O campo `output_tokens_used` deve ser registrado no `DecisionRecord` para rastreabilidade de custo.

---

### Arquitetura do Subpacote `dom_04_frontend`

```
src/deep_ion/
└── dom_04_frontend/                      # subpacote DOM-04 Frontend
    ├── __init__.py
    ├── skill_dev_fe_classifier.py        # Task Classifier — roteia para Junior/Pleno/Sênior
    ├── skill_dev_fe_junior.py            # entry point: Agente Frontend Junior
    ├── skill_dev_fe_pleno.py             # entry point: Agente Frontend Pleno
    ├── skill_dev_fe_senior.py            # entry point: Agente Frontend Sênior
    ├── domain/
    │   ├── __init__.py
    │   ├── task_classifier.py            # Lógica determinística de classificação de complexidade
    │   ├── model_budget_policy.py        # Hard-coded: restrições de modelo por nível
    │   ├── frontend_task.py              # FrontendTask (Pydantic BaseModel, frozen=True)
    │   ├── frontend_tier.py             # Enum FrontendTier: JUNIOR | PLENO | SENIOR
    │   ├── code_generation_result.py    # CodeGenerationResult (Pydantic, frozen=True)
    │   └── output_policy.py             # OutputPolicy — strip_prose(), output_tokens_used
    ├── providers/
    │   ├── __init__.py
    │   ├── llm_provider.py              # Protocol LLMProvider (reutilizado dos outros agentes)
    │   ├── provider_factory.py          # ProviderFactory com suporte a ModelBudgetPolicy
    │   └── budget_aware_provider.py    # BudgetAwareProvider — wraps provider + enforces policy
    ├── infrastructure/
    │   ├── __init__.py
    │   ├── github_client.py             # GitHubClient (reutiliza padrão do projeto)
    │   ├── blueprint_reader.py          # Lê frontend-react-spa.yaml como contexto para o LLM
    │   └── pr_publisher.py              # Publica PR com código gerado
    ├── audit/
    │   ├── __init__.py
    │   └── frontend_ledger.py           # DecisionRecord específico para frontend tasks
    └── prompts/
        ├── classifier_v1.txt            # Prompt do Task Classifier
        ├── junior_codegen_v1.txt        # Prompt de geração Junior
        ├── pleno_codegen_v1.txt         # Prompt de geração Pleno
        └── senior_codegen_v1.txt        # Prompt de geração Sênior
```

---

### Contratos de Input/Output por Skill

#### `skill_dev_fe_classifier` — Task Classifier

```
INPUT  (via GitHub Issue comment, prefixo "## ADR-FE-"):
  - Descrição textual da tarefa frontend
  - Módulo alvo (conta | transacao | categoria | orcamento | meta | relatorio | shared)
  - Arquivos afetados (lista opcional)

PROCESSAMENTO:
  1. Verificações determinísticas de bloqueio (domain/task_classifier.py)
  2. LLM analisa complexidade com confidence_score (modelo: GPT-4o — barato, suficiente)
  3. Se confidence_score < 0.65 → escala para Risk Arbiter (não prossegue)
  4. Publica resultado com tier selecionado e justificativa

OUTPUT (GitHub comment, prefixo "## FE-TIER-"):
  JSON estruturado mínimo — sem prosa:
  {
    "tier": "JUNIOR | PLENO | SENIOR",
    "score_complexidade": float,
    "confidence_score": float,
    "bloqueios_detectados": [str, ...]
  }
  + DecisionRecord no Audit Ledger (campo justificativa preenchido apenas se decision=block/escalar)
```

#### `skill_dev_fe_junior` — Agente Junior

```
INPUT  (lê comment "## FE-TIER-" com tier=JUNIOR):
  - FrontendTask com escopo da tarefa
  - Blueprint frontend-react-spa.yaml como contexto de convenções (via blueprint_reader)

PROCESSAMENTO:
  1. Valida que tier == JUNIOR (bloqueia se tier != JUNIOR)
  2. ModelBudgetPolicy.validate(model) — aborta se modelo não é GPT-4o
  3. Gera código TypeScript via LLM (GPT-4o)
  4. Valida output: layer isolation check (presentation only), sem imports proibidos
  5. Gera testes Vitest + Testing Library correspondentes
  6. OutputPolicy.strip_prose(llm_response) — remove qualquer texto fora de blocos de código
  7. Abre PR ou adiciona commits ao PR existente (body: template estático hardcoded)

OUTPUT:
  - Arquivos de código em presentation/components/ ou presentation/pages/{Feature}/components/
  - Arquivos de teste em tests/presentation/
  - Sem comentário de PR gerado por LLM — body do PR é template estático
  - DecisionRecord: { model_used, confidence_score, tier, output_tokens_used }
```

#### `skill_dev_fe_pleno` — Agente Pleno

```
INPUT  (lê comment "## FE-TIER-" com tier=PLENO):
  - FrontendTask com escopo da tarefa
  - Blueprint frontend-react-spa.yaml + contrato OpenAPI do backend (se aplicável)

PROCESSAMENTO:
  1. Valida que tier == PLENO (bloqueia se tier == SENIOR)
  2. ModelBudgetPolicy.validate(model) — aborta se modelo é Opus 4.6 ou equivalente
  3. Gera código TypeScript via LLM (padrão: GPT-5.1-Codex)
  4. Valida output: layer isolation (presentation + application), hook conventions,
     TanStack Query patterns, i18n obrigatório para textos de usuário
  5. Gera testes unitários (hooks) + integração (MSW mock server)
  6. OutputPolicy.strip_prose(llm_response) — remove qualquer texto fora de blocos de código
  7. Abre PR ou adiciona commits ao PR existente (body: template estático hardcoded)

OUTPUT:
  - Arquivos de código em presentation/, application/hooks/, application/use-cases/
  - Arquivos de teste em tests/application/ e tests/presentation/
  - Sem comentário de PR gerado por LLM — body do PR é template estático
  - DecisionRecord: { model_used, confidence_score, tier, rn_triggered, output_tokens_used }
```

#### `skill_dev_fe_senior` — Agente Sênior

```
INPUT  (lê comment "## FE-TIER-" com tier=SENIOR ou escalação manual):
  - FrontendTask com escopo completo
  - Blueprint completo + ADR do DOM-03 (se T2)
  - TestPlan-{ID} do DOM-05a (se disponível)

PROCESSAMENTO:
  1. Sem restrição de tier de entrada (processa JUNIOR/PLENO/SENIOR — é o fallback final)
  2. ModelBudgetPolicy.validate(model) — sem veto de modelo; recomenda Opus 4.6 por padrão
  3. Análise de impacto cross-layer antes de gerar código
  4. Gera código TypeScript via LLM (padrão: Claude Opus 4.6)
  5. Valida output: layer isolation full stack, auth guards, LGPD markers,
     performance annotations, acessibilidade (aria-* obrigatório em componentes interativos)
  6. Gera testes: unitários + integração + E2E stub (Playwright)
  7. OutputPolicy.strip_prose(llm_response) — remove qualquer texto fora de blocos de código
  8. Abre PR (body: template estático hardcoded; se lgpd_scope=true, adiciona marcação LGPD ao body via código Python — não via LLM)

OUTPUT:
  - Arquivos de código em qualquer camada (presentation/, application/, domain/, infrastructure/)
  - Arquivos de teste incluindo E2E stubs
  - Sem prosa gerada por LLM no PR body — análise de impacto e alertas LGPD são campos estruturados no DecisionRecord, não texto livre
  - DecisionRecord: { model_used, confidence_score, tier, rn_triggered, lgpd_scope, output_tokens_used }
```

---

### Tarefas

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa do modelo |
|---|--------|--------|------------|--------------|-----------------|-------------------------|
| 1 | Formalizar e documentar `FrontendTask`, `FrontendTier` e `CodeGenerationResult` como Pydantic models (contratos de domínio) | DOM-04 | — | #2 | `GPT-4o` | Geração de modelos de dados simples e bem especificados — tarefa trivial, GPT-4o suficiente |
| 2 | Implementar `ModelBudgetPolicy` com restrições hard-coded por tier e método `validate(model, tier)` | DOM-04 | — | #1 | `GPT-4o` | Lógica determinística simples (tabela de allowlist por tier) — não requer modelo avançado |
| 3 | Implementar `TaskClassifier` (domain/) com verificações determinísticas de bloqueio por tier (lista de padrões de caminho e palavras-chave) | DOM-04 | #1 | — | `GPT-4o` | Lógica de pattern matching determinística; sem raciocínio multi-etapa necessário |
| 4 | Implementar `BudgetAwareProvider` que envolve `LLMProvider` e injeta `ModelBudgetPolicy` — recusa chamada se modelo vetado | DOM-04 | #2 | #5, #6, #7 | `GPT-5.1-Codex` | Padrão Decorator com tipagem Protocol — geração de código com múltiplos contratos de interface |
| 5 | Implementar `skill_dev_fe_classifier.py` (entry point) com CLI `typer`, leitura de Issue, análise LLM e publicação de comment `## FE-TIER-` | DOM-04 | #1, #3 | #4, #6, #7 | `GPT-5.1-Codex` | Entry point com orquestração multi-step + integração GitHub API + LLM call |
| 6 | Implementar `skill_dev_fe_junior.py` completo: validação de tier, ModelBudgetPolicy, geração TypeScript (presentation layer only), testes Vitest | DOM-04 | #2, #4 | #5, #7 | `GPT-5.1-Codex` | Geração de código TypeScript com validação de isolamento de camada — requer modelo robusto para código |
| 7 | Implementar `skill_dev_fe_pleno.py` completo: validação de tier, policy, geração hooks + use-cases + pages, testes com MSW | DOM-04 | #2, #4 | #5, #6 | `GPT-5.1-Codex` | Escopo maior que Junior (2 camadas), geração de testes com mock server — nível Codex adequado |
| 8 | Implementar `skill_dev_fe_senior.py` completo: sem restrição de tier, análise cross-layer, geração full stack frontend, E2E stubs Playwright, alertas LGPD | DOM-04 | #2, #4 | — | `Claude Opus 4.6` | Raciocínio arquitetural multi-camada, análise de LGPD, geração de E2E stubs — requer modelo de alta capacidade |
| 9 | Criar prompts versionados para cada skill (`prompts/classifier_v1.txt`, `junior_codegen_v1.txt`, `pleno_codegen_v1.txt`, `senior_codegen_v1.txt`) em modo `execution_only`: instrução obrigatória _"Respond with code blocks only. No explanations. No prose. No markdown outside of code fences."_ + contexto do blueprint `frontend-react-spa.yaml` | DOM-04 | #5, #6, #7, #8 | — | `Claude Opus 4.6` | Engenharia de prompt crítica — contexto extenso do blueprint + convenções TypeScript + instrução de supressão de prosa para redução de tokens |
| 10 | Implementar `blueprint_reader.py` (infrastructure/) que lê `frontend-react-spa.yaml` e injeta seções relevantes no contexto do LLM conforme a skill invocada | DOM-04 | — | #1, #2, #3 | `GPT-4o` | Leitura e parsing de YAML estruturado — tarefa simples de I/O sem lógica complexa |
| 11 | Criar GitHub Actions workflows para os 4 skills (`fe-classifier.yml`, `fe-junior.yml`, `fe-pleno.yml`, `fe-senior.yml`) com triggers via label e comentário | DOM-04 | #5, #6, #7, #8 | — | `GPT-4o` | Geração de YAML de workflow — padrão já bem estabelecido no repositório |
| 12 | Criar testes unitários para `TaskClassifier`, `ModelBudgetPolicy`, `BudgetAwareProvider` e `OutputPolicy` com 100% de cobertura (domain layer contract) — incluir casos: strip_prose remove prosa, strip_prose mantém bloco de código, strip_prose com output vazio gera falha | DOM-04 | #3, #4 | #13 | `GPT-5.1-Codex` | Testes de unidade com casos de borda de policy — requer geração criteriosa de fixtures; OutputPolicy é caminho crítico para conformidade NV |
| 13 | Criar testes de integração para os 3 skills com mocks de GitHub API e LLM provider (pytest + pytest-mock) | DOM-04 | #6, #7, #8 | #12 | `GPT-5.1-Codex` | Testes de integração com multiple mocks — complexidade média, Codex adequado |

---

### Mecanismo de Roteamento (Task Classifier → Skill)

O roteamento é implementado via label GitHub, seguindo o padrão da state machine existente:

```
Comment "## FE-TIER-" publicado pelo Classifier
  → tier = JUNIOR  → label `fe-agent/junior`  → trigger `fe-junior.yml`
  → tier = PLENO   → label `fe-agent/pleno`   → trigger `fe-pleno.yml`
  → tier = SENIOR  → label `fe-agent/senior`  → trigger `fe-senior.yml`
  → confidence < 0.65 → label `fe-agent/escalado` → notifica Tech Lead (sem trigger automático)
```

O Classifier é disparado pela label `gate/3-aprovado` em issues com label
`fe-agent/pending` (aplicada manualmente ou pelo DOM-03 Architecture Agent).

---

### Zona Cinzenta — 5 Verificações Obrigatórias

| Check | Status | Observação |
|-------|--------|------------|
| Consumer Analysis | ⚠️ Atenção | `ModelBudgetPolicy` é consumida pelos 3 skills — mudança futura em allowlist requer atualização coordenada em todos os 3 entry points. Versionar a policy. |
| Business Rule Fingerprint | ✅ CLEAR | Agentes Frontend não tocam RN-01..RN-07 diretamente. Qualquer referência a RN nas tarefas deve ser tratada como escalação automática para Sênior + Gate humano. |
| Data Persistence Check | ✅ CLEAR | Nenhum dos 3 skills persiste estado. Geração de código é idempotente — re-execução produz novo PR ou novo commit. |
| Contract Surface Check | ⚠️ Atenção | O contrato `FE-TIER-` comment é a superfície pública entre Classifier e Skills. Qualquer alteração de schema neste comment quebra o roteamento. Tratar como API — versionar explicitamente. |
| Regulatory Scope Check | 🔴 LGPD | O Sênior Agent deve detectar padrões LGPD na tarefa (campos CPF, email, dados financeiros pessoais) e bloquear com `decision = "escalar"` antes de gerar código. O Pleno e Junior bloqueiam por análise determinística de keywords. Gate humano obrigatório para qualquer tarefa com escopo LGPD, em todas as classificações. |

---

### Riscos e Condições de Bloqueio

- **R1 — Model Allowlist desatualizada:** Se um novo modelo LLM for lançado (ex: `GPT-5.2`),
  o Pleno não o terá em sua allowlist até atualização manual. Risco de degradação de
  capacidade silenciosa. **Mitigação:** `ModelBudgetPolicy` deve logar aviso se modelo
  solicitado não consta na allowlist e usar fallback explícito (não rejeitar silenciosamente).

- **R2 — Classifier produz tier errado com confidence alto:** LLM pode classificar como
  JUNIOR uma tarefa que toca `application/`. **Mitigação:** verificações determinísticas
  de caminho de arquivo (domain/task_classifier.py) rodam ANTES do LLM e são
  invioláveis — são o ground truth. LLM só decide nos casos ambíguos.

- **R3 — Blueprint desatualizado no contexto do LLM:** Se `frontend-react-spa.yaml`
  for atualizado sem re-versionar os prompts, o código gerado pode não refletir as
  novas convenções. **Mitigação:** `blueprint_reader.py` injeta hash de versão do
  blueprint no `DecisionRecord`; prompt version e blueprint version são registrados
  no Audit Ledger para cada execução.

- **R4 — Junior gera código em camada errada:** Junior com lógica de validação fraca
  poderia tentar gerar arquivo em `application/`. **Mitigação:** validação pós-geração
  de output verifica caminhos de arquivo gerados contra allowlist de diretórios do
  tier antes de qualquer commit.

- **R5 — Regressão de verbosidade:** Atualização de modelo LLM ou de prompt pode
  fazer o agente voltar a produzir prosa explicativa, aumentando custo silenciosamente.
  **Mitigação:** `OutputPolicy.strip_prose()` é executado em todos os skills como
  passo obrigatório pré-commit — qualquer output que resulte em 0 blocos de código
  após o strip gera `decision = "block"` no `DecisionRecord` e aborta o PR. O campo
  `output_tokens_used` no Audit Ledger permite rastrear regressões de custo via alerta
  de threshold (ex: > 2× a média dos últimos 10 runs do mesmo tier).

---

### Gates Necessários

| Gate | Responsável | Critério de Aprovação |
|------|-------------|----------------------|
| **Gate 3** (pré-execução) | Tech Lead + Arquiteto | Aprovação deste plano (status: APROVADO + approval.approved_by preenchido) |
| **Gate 4** (pós-PR) | Tech Lead | PR do DOM-04 aprovado pelo DOM-05b (coverage ≥ 80%, architecture compliance, RN audit) |

> Tarefas #9 e #11 requerem revisão humana dos prompts e workflows antes de merge,
> independente da classificação T2. Prompts são artefatos de alta influência sobre
> a qualidade de todo output futuro dos agentes.

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-03-02 | Arquiteto Corporativo | Criação do plano || 2026-03-02 | Arquiteto Corporativo | Adicionada Política de Output Non-Verbose (NV-01..NV-06), OutputPolicy no domínio, ajuste dos contratos OUTPUT dos 3 skills, tarefa #9 atualizada para execution_only, tarefa #12 expandida, risco R5 adicionado |