---
plan_id: PLAN-20260302-003
title: "Scaffolding do Frontend deep-ion — SPA Multi-Tenant (Landing · Admin · Tenant · Agent)"
classification: T2
created_at: "2026-03-02T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: CONCLUIDO
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-02T00:00:00Z"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
closed_at: "2026-03-02T11:20:00Z"
closed_by: "GitHub Copilot"
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

## Plano de Execução — Scaffolding do Frontend deep-ion (SPA Multi-Tenant)
**Classificação de Impacto:** T2

---

### Contexto

O projeto `deep-ion` (a fábrica de software autônoma) não possui frontend próprio.
Este plano cria o scaffolding completo da SPA React 18 que serve de **plano de controle
visual** para operadores e equipes dos clientes (tenants) da fábrica.

O frontend é o ponto de observabilidade humana sobre o pipeline de agentes (DOM-01 → DOM-05b),
concentrando: aprovação de gates, configuração de recursos por tenant e dashboards de trabalho
das equipes técnicas.

**Atenção:** Este frontend é para o repositório `deep-ion`, não para `fintech-pessoal`.
A stack segue **integralmente** o blueprint `architecture/blueprints/frontend-react-spa.yaml`:
React 18 / TypeScript 5 strict / Vite 6 / Tailwind CSS v4 / **shadcn-ui** / TanStack Query v5 /
Zustand v5 / react-router-dom v6 / react-i18next v15 / Keycloak OAuth2 PKCE.

---

### Estrutura de Rotas e Requisitos de Autenticação

```
/                          → LandingPage              (PÚBLICA — sem ProtectedRoute)
/login                     → LoginCallbackPage         (PÚBLICA — callback PKCE)
/admin                     → GlobalAdminDashboard       (auth + role: deep-ion-admin)
/:tenant/                  → TenantHomePage             (auth + role: tenant-member)
/:tenant/admin             → TenantAdminPage            (auth + role: tenant-admin)
/:tenant/dom-:agentId      → AgentDashboardPage         (auth + role: tenant-member)
*                          → NotFoundPage               (PÚBLICA)
```

**Hierarquia de guards:**

```
AppRouter
  ├── / (public)
  ├── /login (public)
  ├── ProtectedRoute (requer autenticação Keycloak)
  │     ├── /admin  →  RoleGuard(deep-ion-admin)
  │     └── TenantRoute (resolve :tenant + verifica membership)
  │           ├── /:tenant/         (role: tenant-member)
  │           ├── /:tenant/admin    (role: tenant-admin)
  │           └── /:tenant/dom-:agentId (role: tenant-member)
  └── * (NotFound)
```

---

### Domínio de Dados — Modelos Principais

Os modelos abaixo devem ser definidos em `frontend/src/domain/models/` como
interfaces TypeScript puras (sem dependências de framework):

| Modelo | Campos principais | Observação |
|--------|------------------|------------|
| `Tenant` | `id`, `slug`, `name`, `status`, `plan`, `createdAt` | Identificador de cliente |
| `Agent` | `id`, `domId` (DOM-01..05b), `status`, `lastRun`, `currentIssue` | Estado de um agente |
| `PendingGate` | `id`, `gateNumber`, `issueNumber`, `prNumber`, `agentId`, `summary`, `classification`, `createdAt` | Tarefas pendentes de gate humano |
| `LlmModel` | `id`, `provider`, `name`, `tier`, `costPerToken`, `enabled` | Modelos disponíveis para o tenant |
| `BudgetConfig` | `tenantId`, `monthlyLimitUsd`, `usedUsd`, `alertThreshold` | Config de orçamento LLM |
| `ApiKeyConfig` | `id`, `service` (github/openai/anthropic), `maskedKey`, `lastRotated` | Chaves externas configuradas |
| `RepoConfig` | `id`, `owner`, `name`, `installationId`, `defaultBranch`, `webhookStatus` | Repositórios GitHub gerenciados |
| `PipelineRun` | `id`, `issueNumber`, `classification`, `currentStage`, `gates`, `startedAt` | Execução de pipeline |
| `Report` | `id`, `type`, `period`, `data`, `generatedAt` | Relatório de atividade |

---

### Descrição Detalhada das Features

#### Feature 1 — Landing Page (`/`)

**Propósito:** Ponto de entrada público. Apresenta a fábrica deep-ion para visitantes
sem exigir autenticação. Funciona como marketing/onboarding institucional.

**Seções (pseudoestrutura):**
- `HeroSection` — headline + call-to-action (login ou contato)
- `PipelineOverviewSection` — animação/diagrama do pipeline T0→T3 (DOM-01…DOM-05b)
- `FeaturesSection` — cards com capabilities da fábrica (Discovery, Requirements, QA, Dev)
- `HowItWorksSection` — sequência visual gates + agentes
- `FooterSection` — links

**Restrições:**
- NENHUMA chamada de API autenticada nesta página
- Toda estilização via shadcn-ui + Tailwind v4
- i18n namespace: `landing`

---

#### Feature 2 — Global Admin Dashboard (`/admin`)

**Propósito:** Visão global da fábrica para o operador `deep-ion-admin`.
Administração de tenants, health dos agentes, métricas globais de custo LLM.

**Seções:**
- `TenantsPanel` — lista de tenants com status, plano e ações (ativar/suspender/criar)
- `AgentHealthPanel` — status de cada agente DOM-XX (running/idle/error) com timestamp do último run
- `GlobalBudgetPanel` — consumo LLM consolidado (todos os tenants) por período
- `SystemEventsPanel` — feed de `DecisionRecord`s recentes do Audit Ledger

**Interações:**
- Criar novo tenant → modal com campos `name`, `slug`, `plan`
- Suspender/ativar tenant → confirmação + chamada API → invalidação de cache
- Drill-down em tenant → navega para `/:tenant/` preservando contexto admin

**i18n namespace:** `admin`

---

#### Feature 3 — Tenant Home Page (`/:tenant/`)

**Propósito:** Dashboard operacional do cliente. Substitui o monitoramento direto
de Issues/PR do GitHub para os membros da equipe do tenant.

**Seções:**
- `PendingGatesPanel` — lista de `PendingGate` aguardando intervenção humana,
  agrupados por `gateNumber` (Gate 1…Gate 5), com botões de ação:
  `/gate1-approve`, `/gate1-reject`, `/ba-approve`, `/gate2-approve`, etc.
  Ações enviam comentário via GitHub API (infraestrutura adapter)
- `PipelineStatusPanel` — `PipelineRun`s ativos com visualização de estágio atual
  (progress indicator DOM-01 → DOM-05b → Gate correspondente)
- `ReportsPanel` — lista de `Report`s gerados (atividade semanal, custo LLM, taxa de sucesso)
- `ActivityFeedPanel` — últimos `DecisionRecord`s do tenant com filtro por agente/classificação

**i18n namespace:** `tenant`

---

#### Feature 4 — Tenant Admin Dashboard (`/:tenant/admin`)

**Propósito:** Configuração de infraestrutura e recursos do cliente pela role `tenant-admin`.

**Seções:**
- `ApiKeysSection` — CRUD de `ApiKeyConfig` (GitHub Token, OpenAI, Anthropic, Copilot)
  - Exibição mascarada (primeiros 4 + `***` + últimos 4 caracteres)
  - Rotação de chave → campo de nova chave + confirmação
  - **Regra de segurança:** chave completa NUNCA trafega no payload de resposta GET
- `LlmModelsSection` — lista de `LlmModel` disponíveis, toggle de habilitar/desabilitar por tenant
  - Filtros por provider (openai / anthropic / copilot / local)
  - Exibição de custo estimado por 1M tokens
- `BudgetSection` — configuração de `BudgetConfig`
  - Limite mensal em USD
  - Threshold de alerta (%)
  - Histórico de consumo por mês (gráfico de barras com recharts ou similar)
- `RepositoriesSection` — CRUD de `RepoConfig`
  - Adicionar repositório → input `owner/repo` + validar instalação GitHub App
  - Status do webhook (active/inactive/error)
  - Branch padrão para criação de PRs pelo DOM-04

**Zona cinzenta — verificações obrigatórias:**

| Check | Status | Observação |
|-------|--------|------------|
| Consumer Analysis | ⚠️ Verificar | `ApiKeyConfig` é lida por múltiplos agentes Python — qualquer mudança de schema impacta os agentes |
| Business Rule Fingerprint | ✅ Sem RN | Não toca em RN-01..07 (domínio fintech) |
| Data Persistence Check | ⚠️ Atenção | `BudgetConfig` persiste dados de custo — precisa de migration se houver backend próprio |
| Contract Surface Check | ⚠️ Bloqueante | API contract para `/tenants/:id/api-keys`, `/tenants/:id/models`, `/tenants/:id/budget` e `/tenants/:id/repositories` deve ser definido antes da implementação |
| Regulatory Scope Check | 🔴 Atenção | API Keys são credenciais sensíveis — tokenService rules se aplicam. Nunca armazenar em localStorage. |

**i18n namespace:** `tenant-admin`

---

#### Feature 5 — Agent Team Dashboard (`/:tenant/dom-:agentId`)

**Propósito:** Workspace das equipes (analistas, devs, fullstack) para acompanhar e
interagir com um agente específico do pipeline.

**Parâmetro `:agentId`:** valor numérico ou slug — ex.: `/acme/dom-02`, `/acme/dom-04`

**Seções:**
- `AgentHeaderSection` — identidade do agente (nome, DOM-XX, status atual, última execução)
- `ActiveIssuesPanel` — Issues vinculadas a este agente, com classification badge (T0/T1/T2/T3)
  e estágio atual no pipeline. Link direto para GitHub Issue.
- `GateActionsPanel` — gates pendentes DESTE agente — mesma lógica de PendingGatesPanel
  mas filtrado por `agentId`
- `SkillLogsPanel` — output das skills (SKILL-REQ-00, SKILL-QAN-01, etc.) em format colapsável,
  renderizado como Markdown (usar `react-markdown` + sanitização DOMPurify)
- `DecisionRecordsPanel` — Audit Ledger filtrado por agente, com `confidence_score` visualizado
  como barra de progresso colorida (verde ≥ 0.80, amarelo 0.65–0.79, vermelho < 0.65)

**Regra de UX:** `confidence_score < 0.65` deve renderizar um alerta visual proeminente
(shadcn-ui `Badge` com variant `destructive`) indicando que o agente escalou para revisão humana.

**i18n namespace:** `agent`

---

### Estrutura de Diretórios Proposta

```
frontend/                               # raiz dentro do repositório deep-ion
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.ts
  vitest.config.ts
  .env.example
  index.html
  public/
    favicon.ico
    robots.txt
  src/
    main.tsx                            # providers: QueryClient, Auth, i18n, StrictMode
    App.tsx                             # AppRouter + top-level ErrorBoundary
    presentation/
      routes/
        AppRouter.tsx                   # todas as rotas declaradas aqui
        ProtectedRoute.tsx              # verifica autenticação Keycloak
        TenantRoute.tsx                 # resolve :tenant + verifica membership
        RoleGuard.tsx                   # verifica role Keycloak do usuário
      pages/
        Landing/
          LandingPage.tsx
          components/
            HeroSection.tsx
            PipelineOverviewSection.tsx
            FeaturesSection.tsx
            HowItWorksSection.tsx
            FooterSection.tsx
        Login/
          LoginCallbackPage.tsx
        GlobalAdmin/
          GlobalAdminPage.tsx
          components/
            TenantsPanel.tsx
            AgentHealthPanel.tsx
            GlobalBudgetPanel.tsx
            SystemEventsPanel.tsx
        TenantHome/
          TenantHomePage.tsx
          components/
            PendingGatesPanel.tsx
            PipelineStatusPanel.tsx
            ReportsPanel.tsx
            ActivityFeedPanel.tsx
        TenantAdmin/
          TenantAdminPage.tsx
          components/
            ApiKeysSection.tsx
            LlmModelsSection.tsx
            BudgetSection.tsx
            RepositoriesSection.tsx
        AgentDashboard/
          AgentDashboardPage.tsx
          components/
            AgentHeaderSection.tsx
            ActiveIssuesPanel.tsx
            GateActionsPanel.tsx
            SkillLogsPanel.tsx
            DecisionRecordsPanel.tsx
        NotFound/
          NotFoundPage.tsx
      components/
        ui/                             # primitivos shadcn-ui estendidos
          ConfidenceScoreBadge.tsx
          ClassificationBadge.tsx       # T0/T1/T2/T3 colorido
          PipelineProgress.tsx          # DOM-01→05b progress indicator
          GateActionButton.tsx          # botão /gateN-approve etc.
          MaskedApiKey.tsx              # exibição mascarada de credenciais
        layout/
          AppShell.tsx                  # layout raiz com sidebar + topbar
          TenantSidebar.tsx             # sidebar contextualizada ao tenant
          GlobalAdminSidebar.tsx        # sidebar para /admin
          Topbar.tsx
          PageHeader.tsx
    application/
      hooks/
        useAuth.ts                      # expõe user, roles, login(), logout()
        useTenant.ts                    # resolve :tenant param + dados do tenant
        usePendingGates.ts
        usePipelineRuns.ts
        useAgentStatus.ts
        useApiKeys.ts
        useLlmModels.ts
        useBudgetConfig.ts
        useRepositories.ts
        useDecisionRecords.ts
        useSkillLogs.ts
        useGlobalMetrics.ts
        useTenants.ts                   # (admin) lista todos os tenants
      use-cases/
        approveGateUseCase.ts           # POST comentário GitHub via adapter
        rejectGateUseCase.ts
        createTenantUseCase.ts
        updateApiKeyUseCase.ts
        rotateApiKeyUseCase.ts
        updateBudgetConfigUseCase.ts
        toggleLlmModelUseCase.ts
        addRepositoryUseCase.ts
      stores/
        authStore.ts                    # user info + roles (Zustand)
        tenantContextStore.ts           # tenant ativo na sessão (Zustand)
        uiStore.ts                      # sidebar open/close, theme (Zustand)
    domain/
      models/
        tenant.ts
        agent.ts
        pendingGate.ts
        llmModel.ts
        budgetConfig.ts
        apiKeyConfig.ts
        repoConfig.ts
        pipelineRun.ts
        report.ts
        decisionRecord.ts
        skillLog.ts
      errors/
        DomainError.ts
        GateActionError.ts
        TenantNotFoundError.ts
        UnauthorizedRoleError.ts
      validators/
        tenantSlugValidator.ts
        budgetValidator.ts
        repoConfigValidator.ts
    infrastructure/
      api/
        generated/                      # OpenAPI client gerado — não editar manualmente
        adapters/
          tenantAdapter.ts
          agentAdapter.ts
          gateAdapter.ts                # POST comentário GitHub (/gate1-approve etc.)
          llmModelAdapter.ts
          budgetAdapter.ts
          apiKeyAdapter.ts
          repositoryAdapter.ts
          decisionRecordAdapter.ts
          skillLogAdapter.ts
          reportAdapter.ts
      auth/
        authProvider.ts                 # Keycloak SDK wrapper (PKCE S256)
        tokenService.ts                 # memory-only token storage
      http/
        httpClient.ts                   # Axios instance + interceptors (401 re-auth)
        queryKeys.ts                    # fábrica de query keys tipadas
    shared/
      i18n/
        index.ts
        pt-BR.json                      # namespaces: common, errors, auth, landing,
        en.json                         #             admin, tenant, tenant-admin, agent
      constants/
        ROUTES.ts                       # todas as strings de path centralizadas
        AGENT_IDS.ts                    # DOM-01..05b slugs e metadados
        CLASSIFICATION_COLORS.ts        # T0=verde..T3=vermelho (tokens Tailwind)
      utils/
        cn.ts                           # clsx + tailwind-merge helper
        formatCurrency.ts
        formatDate.ts
        maskApiKey.ts
      types/
        pagination.types.ts
        api-response.types.ts
    assets/
      images/
      fonts/
      icons/                            # SVGs como React components (vite-plugin-svgr)
```

---

### Tarefas

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa do modelo |
|---|--------|--------|------------|--------------|-----------------|-------------------------|
| 1 | Scaffolding base: package.json, tsconfig, vite.config, tailwind.config v4, shadcn-ui (via `npx shadcn@latest init`), .env.example, index.html, main.tsx, App.tsx | DOM-04 Sênior | — | — | `GPT-5.1-Codex` | Geração de múltiplos arquivos de configuração com interdependências precisas |
| 2 | Infraestrutura de Auth: authProvider.ts (Keycloak PKCE S256), tokenService.ts (memory-only), httpClient.ts (interceptors 401 + re-auth) | DOM-04 Sênior | #1 | #3, #4 | `GPT-5.1-Codex` | Segurança crítica — PKCE flow sem erros de implementação |
| 3 | Domain models + domain errors + validators (todos os modelos listados em "Domínio de Dados") | DOM-04 Pleno | #1 | #2, #4 | `GPT-5.1-Codex` | Múltiplos arquivos TypeScript strict — sem dependência de framework |
| 4 | Router + guards: ROUTES.ts, AppRouter.tsx, ProtectedRoute.tsx, TenantRoute.tsx, RoleGuard.tsx | DOM-04 Sênior | #1 | #2, #3 | `GPT-5.1-Codex` | Roteamento multi-tenant com hierarquia de guards é complexidade T2 |
| 5 | Infraestrutura API: adapters (sem geração OpenAPI — backend pendente), queryKeys.ts, estrutura de pastas `generated/` vazia com README | DOM-04 Sênior | #2, #3 | #6, #7, #8 | `GPT-5.1-Codex` | Adapters leem de domain models (#3) e httpClient (#2); em modo mock retornam fixtures diretamente |
| 5b | JSON Stub Layer: `msw init`, `browser.ts`, `handlers.ts`, todos os arquivos `fixtures/*.json` com dados realistas para os 12 recursos | DOM-04 Junior | #3, #5 | #6 | `GPT-4o` | Geração de JSON estruturado com dados variados — tarefa T0, sem lógica de negócio |
| 6 | Shared layer: cn.ts, formatCurrency.ts, formatDate.ts, maskApiKey.ts, AGENT_IDS.ts, CLASSIFICATION_COLORS.ts + i18n skeleton (namespaces vazios pt-BR + en) | DOM-04 Junior | #1 | #5 (leitura apenas) | `GPT-4o` | Utilities simples e arquivos JSON de i18n — tarefa trivial T0 |
| 7 | Zustand stores: authStore.ts, tenantContextStore.ts, uiStore.ts | DOM-04 Pleno | #3 | #5 | `GPT-4o` | Stores simples com persist middleware para UI state |
| 8 | Application hooks: todos os useXxx.ts (14 hooks listados) | DOM-04 Pleno | #5, #7 | — | `GPT-5.1-Codex` | Integração hooks↔adapters↔react-query requer consistência entre arquivo |
| 9 | Componentes UI globais: ConfidenceScoreBadge, ClassificationBadge, PipelineProgress, GateActionButton, MaskedApiKey | DOM-04 Junior | #6 | #10 | `GPT-4o` | Componentes atômicos isolados — T0 |
| 10 | Layout shell: AppShell.tsx, TenantSidebar.tsx, GlobalAdminSidebar.tsx, Topbar.tsx, PageHeader.tsx | DOM-04 Pleno | #6, #9 | #9 | `GPT-4o` | Composição de layout com shadcn-ui — sem lógica de negócio |
| 11 | Landing Page completa (Feature 1): LandingPage + 5 seções + i18n namespace `landing` preenchido | DOM-04 Junior | #6, #9, #10 | #12, #13, #14, #15 | `GPT-4o` | Página pública sem autenticação, apenas apresentação — T0 |
| 12 | Global Admin Dashboard (Feature 2): page + 4 panels + use-cases + i18n namespace `admin` | DOM-04 Pleno | #8, #10 | #11, #13, #14, #15 | `GPT-4o` | Lógica de gestão de tenants com react-query — T1 |
| 13 | Tenant Home Page (Feature 3): page + 4 panels + GateActionButton integrado + i18n namespace `tenant` | DOM-04 Pleno | #8, #10 | #11, #12, #14, #15 | `GPT-4o` | Feature principal de operação — requer approveGateUseCase |
| 14 | Tenant Admin Dashboard (Feature 4): page + 4 seções + use-cases de config + i18n namespace `tenant-admin` | DOM-04 Sênior | #8, #10 | #11, #12, #13, #15 | `GPT-5.1-Codex` | API Keys + Budget = credenciais sensíveis — requer atenção de segurança |
| 15 | Agent Team Dashboard (Feature 5): page + 5 panels + SkillLogs (react-markdown + DOMPurify) + i18n namespace `agent` | DOM-04 Pleno | #8, #10 | #11, #12, #13, #14 | `GPT-4o` | Renderização de Markdown sanitizado necessita atenção XSS |
| 16 | Testes: unit (domain validators 100%), component (ui/ components), integration (hooks + MSW mocks), e2e smoke (Playwright: login, landing, tenant home) | DOM-05b | #11–#15 | — | `GPT-5.1-Codex` | Cobertura obrigatória ≥ 80% global, 100% domain — múltiplos arquivos de teste |
| 17 | CI/CD: GitHub Actions workflow (tsc, eslint, vitest --coverage, lighthouse-ci, npm audit, i18next-parser) | DOM-04 Sênior | #16 | — | `GPT-4o` | Workflow YAML de CI — configuração padrão |

---

### Estratégia de Prototipação — JSON Stubs (Mock Layer)

> **Contexto:** Para a fase inicial de prototipação, o backend ainda não expõe endpoints funcionais.
> O frontend deve operar em modo **mock-first**: cada chamada de API é interceptada e respondida
> com dados locais em JSON, permitindo uma versão funcional e navegável sem dependência do backend.
> À medida que os endpoints reais ficam disponíveis, os handlers mock são removidos um a um.

#### Mecanismo: MSW (Mock Service Worker) em modo desenvolvimento

- **Biblioteca:** `msw` v2 — já referenciada no blueprint para testes de integração.
  Na prototipação, o mesmo MSW é ativado via `VITE_USE_MOCK=true` em `.env.local`.
- **Service Worker:** `public/mockServiceWorker.js` (gerado por `npx msw init public/`).
- **Handlers:** `src/infrastructure/api/mocks/handlers.ts` — registra um handler MSW por
  endpoint, cada um lendo o JSON fixture correspondente.
- **Fixtures:** `src/infrastructure/api/mocks/fixtures/` — um arquivo `.json` por recurso.
- **Inicialização condicional em `main.tsx`:**
  ```
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('@infrastructure/api/mocks/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
  }
  ```
- **Migração gradual:** quando um endpoint real é implementado, o handler correspondente
  é removido de `handlers.ts` — nenhuma outra alteração necessária no código de produção.

#### Estrutura de arquivos adicionais

```
frontend/
  public/
    mockServiceWorker.js              # gerado por msw init — não editar manualmente
  src/
    infrastructure/
      api/
        mocks/
          browser.ts                  # cria e exporta o MSW worker (browser environment)
          handlers.ts                 # agrega todos os handlers por domínio
          fixtures/
            tenants.json              # GET /tenants, GET /tenants/:id
            agents.json               # GET /tenants/:id/agents
            pending-gates.json        # GET /tenants/:id/gates/pending
            pipeline-runs.json        # GET /tenants/:id/pipeline-runs
            llm-models.json           # GET /tenants/:id/models
            budget-config.json        # GET /tenants/:id/budget
            api-keys.json             # GET /tenants/:id/api-keys (mascaradas)
            repositories.json         # GET /tenants/:id/repositories
            decision-records.json     # GET /tenants/:id/decision-records
            skill-logs.json           # GET /tenants/:id/agents/:id/logs
            reports.json              # GET /tenants/:id/reports
            global-metrics.json       # GET /admin/metrics
```

#### Convenções dos JSON fixtures

- Fixtures devem seguir o **schema exato do domain model** (não o DTO de backend) —
  os adapters continuam sendo responsáveis pela transformação quando o backend real for integrado.
- Fixtures devem conter **dados realistas e variados** (mix de statuses, classificações, etc.)
  para exercitar todos os estados visuais dos componentes.
- Endpoints de escrita (`POST`, `PUT`, `DELETE`) retornam `{ success: true }` com
  o objeto atualizado simulado — sem persistência entre reloads.
- **Segurança:** fixtures de `api-keys.json` NUNCA devem conter chaves reais —
  usar placeholders no formato `ghp_XXXX...XXXX` (mascaradas).

#### Impacto nos gates

- **Gate 2 (API contract):** O risco R1 fica **desativado para prototipação** —
  o frontend avança sem API contract formal. O contrato é derivado retroativamente
  dos fixtures quando o backend for especificado.
- **Gate 4:** Antes do merge para produção, os handlers mock devem ser removidos
  para os endpoints implementados. `handlers.ts` deve estar vazio (ou ausente)
  quando `VITE_USE_MOCK=false`.

---

### Ordem de Execução Resumida

```
Fase A (série):    #1
Fase B (paralelo): #2, #3, #4
Fase C (paralelo): #5, #6, #7          (aguarda B)
Fase C' (paralelo): #5b               (aguarda #3, #5 — pode iniciar junto com #6, #7)
Fase D (paralelo): #8, #9, #10        (aguarda C e C')
Fase E (paralelo): #11, #12, #13, #14, #15  (aguarda D)
Fase F (série):    #16                (aguarda E)
Fase G (série):    #17                (aguarda F)
```

---

### Decisões Arquiteturais (ADRs a formalizar pelo DOM-03)

**ADR-FE-DI-01 — Estratégia de Auth na Landing Page**
- **Decisão:** `ProtectedRoute` NÃO envolve `/` — autenticação é iniciada apenas por
  CTA explícito do usuário. `authProvider.ts` só inicializa o SDK após clique em "Entrar".
- **Alternativa rejeitada:** Silent check-SSO na landing — degradaria UX para visitantes
  não autenticados e adicionaria latência desnecessária.
- **Consequência:** `tokenService` deve tratar graciosamente o estado "não inicializado"
  sem lançar exceção.

**ADR-FE-DI-02 — Resolução de Tenant via URL**
- **Decisão:** `:tenant` é o **slug** do tenant (ex.: `acme-corp`). O `TenantRoute`
  carrega o objeto `Tenant` via `useTenant(slug)` e injeta no contexto via `tenantContextStore`.
  Slug inválido ou sem membership → redireciona para `/not-found` com mensagem localizada.
- **Consequência:** `ROUTES.ts` deve ter helper `tenantRoute(slug: string, path: string) → string`
  para construção segura de URLs multi-tenant.

**ADR-FE-DI-03 — Renderização de Logs de Skill**
- **Decisão:** Logs das skills (conteúdo Markdown) devem ser renderizados com
  `react-markdown` + sanitização obrigatória via `DOMPurify` antes de qualquer inserção no DOM.
  `dangerouslySetInnerHTML` é absolutamente proibido (blueprint + XSS rules).
- **Consequência:** `SkillLogsPanel` é responsabilidade do DOM-04 Sênior (não Junior),
  pois envolve consideração de segurança XSS explícita.

**ADR-FE-DI-05 — Estratégia Mock-First com MSW + JSON Fixtures**
- **Decisão:** Durante a prototipação, o MSW (Mock Service Worker) intercepta todas as
  chamadas HTTP no browser e retorna dados de `fixtures/*.json`. O toggle é controlado
  por `VITE_USE_MOCK=true` em `.env.local`. Os adapters de produção permanecem inalterados.
- **Alternativa rejeitada:** Dados mockados diretamente nos hooks (`useState([...])`) —
  introduziria acoplamento de dados de teste no código de produção, dificultando a remoção.
- **Alternativa rejeitada:** Servidor JSON local (`json-server`) — exigiria processo Node
  separado, complicando o setup de desenvolvimento e CI.
- **Consequência:** A tarefa #5b deve ser concluída antes de #8 (hooks) para que os hooks
  já possam ser desenvolvidos e testados contra dados realistas desde o início.
  O campo `onUnhandledRequest: 'warn'` no worker garante visibilidade de endpoints não mockados.

**ADR-FE-DI-04 — Gate Actions como Comentários GitHub**
- **Decisão:** Ações de gate (`/gate1-approve`, `/ba-reject`, etc.) são enviadas
  como **comentários POST na GitHub Issues API** via `gateAdapter.ts`, não como chamadas
  diretas a uma API própria da fábrica.
- **Consequência:** `gateAdapter.ts` requer um `GITHUB_API_TOKEN` do usuário autenticado
  (injetado via `httpClient` interceptor). `ApiKeyConfig` com `service = github` do tenant
  é usada como fallback se o usuário não tiver token pessoal configurado.

---

### Riscos e Condições de Bloqueio

| # | Risco | Severidade | Mitigação |
|---|-------|-----------|-----------|
| R1 | API contract backend não definida → adapters não têm contrato formal | 🟡 ALTO → **Mitigado para prototipação** | Tarefa #5b (JSON Stubs) desbloqueia o desenvolvimento frontend; contrato formal será derivado dos fixtures ao especificar o backend. Bloqueante apenas para o Gate 4 (merge para produção). |
| R2 | Keycloak não configurado para o ambiente `deep-ion` → auth não pode ser testada em integração | 🟡 ALTO | Criar mock de `authProvider` para desenvolvimento local; configurar Keycloak no ambiente de staging antes de Gate 4 |
| R3 | shadcn-ui + Tailwind v4 requer atenção na instalação dos primitivos Radix — incompatibilidade possível com versões beta | 🟡 ALTO | Tarefa #1 deve fixar versões exatas (sem `^`) e executar `npx shadcn@latest init` com flag `--no-npm-install` para inspeção antes de prosseguir |
| R4 | `gateAdapter.ts` (ADR-FE-DI-04) opera com token do usuário — risco de permissão insuficiente na GitHub API | 🟡 MÉDIO | Documentar scopes necessários (`repo`, `write:discussion`) em `.env.example` |
| R5 | Lighthouse CI < 85 de performance na landing page — shadcn-ui copy-paste model minimiza bundle, mas Radix UI primitives têm custo | 🟟 BAIXO | Aplicar lazy loading e code splitting rigoroso desde a Tarefa #4; importar apenas os componentes shadcn-ui utilizados |
| R6 | MaskedApiKey — exibição de credenciais sensíveis | 🔴 BLOQUEANTE | Nunca armazenar key completa em estado React ou localStorage. Tarefa #14 deve passar por revisão de segurança no Gate 4 |

---

### Gates Necessários

| Gate | Condição | Aprovadores |
|------|----------|-------------|
| Gate 1 (`/gate1-approve`) | Aprovação deste plano de execução | Arquiteto + PO |
| Gate 2 (`/gate2-approve`) | API contract definida (mínimo: endpoints das 5 features + schema dos 10 modelos) | Tech Lead |
| Gate 3 (`/gate3-approve`) | Scaffolding base (#1) + Auth infra (#2) implementados e revisados | Tech Lead + Arquiteto |
| Gate 4 (`/gate4-approve`) | PR com features #11–#15 + cobertura ≥ 80% + Lighthouse ≥ 85 | Tech Lead + QA |
| Gate 5 (Homologação) | Smoke tests E2E passando em staging com Keycloak real | QA + PO |

---

### Convenções Específicas deste Módulo

1. **Nenhuma referência a `fintech-pessoal` no código** — este frontend é do `deep-ion`.
2. **`ROUTES.ts` é fonte de verdade única** — nenhuma string de path fora deste arquivo.
3. **`confidence_score < 0.65`** deve sempre renderizar `ConfidenceScoreBadge` com
   variant `danger` e texto i18n `agent.escalated_to_human`.
4. **Classificação T0/T1/T2/T3** usa cores semânticas: T0=green, T1=blue, T2=yellow, T3=red
   — definidas em `CLASSIFICATION_COLORS.ts` como tokens Tailwind, nunca como hex hardcoded.
5. **Agent IDs** (`dom-01` … `dom-05b`) são definidos em `AGENT_IDS.ts` com metadados
   (nome, descrição, cor, ícone) — nenhum componente hardcoda strings de agente.

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-03-02 | Arquiteto Corporativo | Criação do plano |
| 2026-03-02 | Arquiteto Corporativo | Atualização: ui_library heroui → shadcn-ui (alinhamento com blueprint); adição da estratégia de prototipação Mock-First (MSW + JSON Stubs), tarefa #5b, ADR-FE-DI-05 e mitigação do risco R1 |
| 2026-03-02 | Angelo Pereira | **Aprovação do plano** — status alterado para APROVADO |
| 2026-03-02 | GitHub Copilot | **Execução do plano concluída** — scaffold frontend implementado em `frontend/` (camadas, rotas, mocks MSW/JSON, validação com typecheck/lint/test/build) e plano preparado para arquivamento |
