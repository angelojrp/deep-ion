---
plan_id: PLAN-20260226-001
title: "Configuração do Módulo Frontend ReactJS — fintech-pessoal"
classification: T2
created_at: "2026-02-26T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: APROVADO
approval:
  approved_by: ""
  approved_at: ""
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

## Plano de Execução — Configuração do Módulo Frontend ReactJS (fintech-pessoal)
**Classificação de Impacto:** T2

---

### Contexto

O projeto `fintech-pessoal` prevê React 18 como frontend (conforme documentação de
stack em `copilot-instructions.md`), mas o módulo ainda não existe no workspace.
Esta demanda cria toda a infraestrutura de frontend a partir do zero, integrando-a
ao pipeline de CI da fábrica e ao backend Spring Boot 3.

Escopo da configuração:
- Scaffolding do projeto React 18 + TypeScript + Vite
- Estrutura de módulos alinhada aos domínios do backend (`conta`, `transacao`,
  `categoria`, `orcamento`, `meta`, `relatorio`, `shared`)
- Camada de integração com a API REST do backend
- Infraestrutura de testes (Vitest + React Testing Library)
- Pipeline CI/CD para build e lint do frontend

**Zona cinzenta identificada — 5 verificações obrigatórias:**

| Check | Status | Observação |
|-------|--------|------------|
| Consumer Analysis | ⚠️ Verificar | Frontend consumirá todos os endpoints; contrato de API pública deve existir antes da implementação |
| Business Rule Fingerprint | ⚠️ Atenção | RN-01 (saldo) e RN-03 (transação confirmada) precisam ter tratamento de erro visual explícito |
| Data Persistence Check | N/A | Frontend não persiste dados diretamente |
| Contract Surface Check | ⚠️ Bloqueante | OpenAPI spec do backend deve ser gerada e revisada ANTES de iniciar a camada de serviços |
| Regulatory Scope Check | 🔴 LGPD | Dados financeiros pessoais exibidos na UI — autenticação, autorização e mascaramento de dados são obrigatórios. Gate humano obrigatório em todas as classes. |

> **AVISO LGPD:** A ausência de controles de autenticação/autorização visíveis na
> UI constitui bloqueio automático, independente da classificação T2. Nenhuma tela
> que exiba dados financeiros pode ser lançada sem revisão humana do fluxo de auth.

---

### Decisões Arquiteturais (ADRs a serem formalizados pelo DOM-03)

**ADR-FE-01 — Build Toolchain**
- **Escolhido:** Vite 5 + TypeScript 5 (strict mode)
- **Alternativas rejeitadas:** Create React App (deprecated), Next.js (SSR desnecessário para SPA financeira interna)
- **Justificativa:** HMR instantâneo, build otimizado com tree-shaking nativo, suporte a path aliases

**ADR-FE-02 — Gerenciamento de Estado**
- **Escolhido:** TanStack Query v5 (server state) + Zustand (client state)
- **Alternativas rejeitadas:** Redux Toolkit (overhead para este porte), Context API puro (performance em listas financeiras)
- **Justificativa:** TanStack Query elimina código de loading/error boilerplate e sincroniza cache com backend; Zustand para estado UI local

**ADR-FE-03 — Estilização**
- **Escolhido:** Tailwind CSS 3 + shadcn/ui (componentes headless)
- **Alternativas rejeitadas:** Material UI (bundle pesado), CSS Modules (verboso)
- **Justificativa:** Design system consistente sem lock-in de componente; shadcn gera código proprietário

**ADR-FE-04 — Roteamento**
- **Escolhido:** React Router v6 (Data API)
- **Justificativa:** Padrão de mercado, suporte a data loaders reduz waterfall de requisições

**ADR-FE-05 — Integração com Backend**
- **Escolhido:** Cliente gerado via `openapi-typescript-codegen` a partir da spec OpenAPI do Spring Boot
- **Pré-requisito bloqueante:** Backend deve expor `GET /v3/api-docs` antes da Tarefa #4

---

### Estrutura de Diretórios Proposta (pseudocódigo para DOM-04)

```
fintech-pessoal/
└── frontend/                        # raiz do módulo frontend
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── vitest.config.ts
    ├── .eslintrc.cjs
    ├── .prettierrc
    ├── public/
    └── src/
        ├── main.tsx                 # entrypoint
        ├── App.tsx                  # root component + providers
        ├── router.tsx               # rotas centralizadas
        ├── shared/                  # análogo ao módulo shared do backend
        │   ├── components/          # componentes reutilizáveis
        │   ├── hooks/
        │   ├── lib/                 # axios instance, query client
        │   ├── types/               # tipos globais
        │   └── utils/
        ├── modules/
        │   ├── conta/
        │   │   ├── components/
        │   │   ├── hooks/           # useContas, useContaById
        │   │   ├── pages/
        │   │   └── services/        # gerado via OpenAPI
        │   ├── transacao/
        │   │   ├── components/
        │   │   │   └── TransacaoForm/   # RN-01, RN-03 tratados aqui
        │   │   ├── hooks/
        │   │   ├── pages/
        │   │   └── services/
        │   ├── categoria/
        │   ├── orcamento/
        │   ├── meta/
        │   └── relatorio/
        └── __tests__/               # testes globais de integração UI
```

> **Regra de fronteira:** A mesma separação de módulos do Spring Modulith é
> espelhada no frontend. Um módulo de frontend **não importa diretamente** de
> outro módulo de frontend — comunicação via `shared/` ou via estado global
> (Zustand). Isso garante coerência arquitetural entre as camadas.

---

### Tratamento de Regras de Negócio na UI

| RN | Impacto no Frontend | Implementação esperada |
|----|---------------------|------------------------|
| RN-01 | Exibir erro de saldo insuficiente | Interceptor HTTP → toast "Saldo Insuficiente" ao receber HTTP 422 com código `SALDO_INSUFICIENTE` |
| RN-02 | Transferência: feedback de atomicidade | Spinner bloqueante durante chamada; rollback visual em caso de falha parcial |
| RN-03 | Bloquear exclusão de transação CONFIRMADA | Botão "Excluir" desabilitado + tooltip explicativo para `status === 'CONFIRMADA'` |
| RN-04 | Filtro de orçamento | Date picker limitado a períodos válidos; validação client-side antes do envio |
| RN-05 | Meta atingida | Consumir SSE ou polling de `MetaAtingidaEvent` → notificação visual |
| RN-06 | Categoria padrão não excluível | Ícone de lock em categorias `padrao = true`; botão excluir oculto |
| RN-07 | Relatório só com CONFIRMADAS | Filtro server-side; UI deve informar que pendentes são excluídas |

---

### Tarefas

| # | Tarefa | Agente | Depende de | Paralelo com | Modelo sugerido | Justificativa do modelo |
|---|--------|--------|------------|--------------|-----------------|-------------------------|
| 1 | Formalizar ADRs FE-01 a FE-05 como arquivos em `architecture/decisions/` | DOM-03 | — | #2 | `Claude Opus 4.6` | Raciocínio arquitetural com trade-offs documentados |
| 2 | Verificar e publicar OpenAPI spec do backend (`springdoc-openapi`) — pré-requisito de contrato | DOM-04 | — | #1 | `GPT-5.1-Codex` | Geração/ajuste de código Spring; adição de `springdoc-openapi-starter-webmvc-ui` ao `pom.xml` |
| 3 | Scaffold `frontend/` com Vite + React 18 + TypeScript strict + Tailwind + shadcn/ui | DOM-04 | #1 | — | `GPT-5.1-Codex` | Geração de múltiplos arquivos de configuração de build |
| 4 | Gerar cliente HTTP tipado via `openapi-typescript-codegen` a partir da spec do #2 | DOM-04 | #2, #3 | — | `GPT-5.1-Codex` | Geração de código; requer spec OpenAPI no input |
| 5 | Implementar `shared/` — Axios instance, QueryClient, ErrorBoundary, interceptores de RN | DOM-04 | #3, #4 | — | `GPT-5.1-Codex` | Lógica de integração com múltiplos arquivos |
| 6 | Implementar módulos por domínio (conta, transacao, categoria, orcamento, meta, relatorio) com pages + hooks + tratamento de RN na UI | DOM-04 | #5 | — | `GPT-5.1-Codex` | Maior tarefa; múltiplos módulos com lógica de RN |
| 7 | Configurar roteamento central (`router.tsx`) com guards de autenticação — **LGPD obrigatório** | DOM-04 | #6 | — | `GPT-5.1-Codex` | Requer análise de segurança + codegen |
| 8 | Implementar infraestrutura de testes (Vitest + RTL) — cobertura ≥ 80% em componentes de RN | DOM-04 | #6 | #7 | `GPT-5.1-Codex` | Geração de suítes de teste por módulo |
| 9 | Configurar workflow CI para frontend (lint + typecheck + vitest) em `.github/workflows/` | DOM-04 | #3 | #6, #7, #8 | `GPT-4o` | Geração de YAML de workflow; tarefa de baixa complexidade lógica |
| 10 | QA Técnico — verificar cobertura, conformidade arquitetural e RNs na UI | DOM-05b | #8, #9 | — | `Claude Opus 4.6` | Auditoria de conformidade multi-dimensão |

---

### Riscos e Condições de Bloqueio

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| R-01 | Backend não tem OpenAPI spec configurada — Tarefa #4 fica bloqueada | 🔴 CRÍTICO | Tarefa #2 é pré-requisito hard; DOM-04 deve verificar e adicionar `springdoc-openapi` antes de qualquer geração de cliente |
| R-02 | Dados financeiros pessoais exibidos sem autenticação (LGPD) | 🔴 BLOQUEANTE | Tarefa #7 inclui guards obrigatórios; nenhum deploy sem Gate 3 humano aprovando o fluxo de auth |
| R-03 | Fronteiras de módulo frontend violadas (import cruzado entre módulos) | 🟠 ALTO | Regra de fronteira documentada na estrutura; DOM-05b deve verificar imports transversais |
| R-04 | Tratamento de RN-03 ausente na UI — usuário tenta excluir transação CONFIRMADA | 🟠 ALTO | Tabela de RN→UI acima é contrato obrigatório para DOM-04 |
| R-05 | Bundle size excessivo em produção | 🟡 MÉDIO | Vite + tree-shaking + lazy loading por rota; DOM-05b verifica bundle analyzer no PR |
| R-06 | Inconsistência de tipos entre frontend e backend após refatoração | 🟡 MÉDIO | Cliente gerado via OpenAPI spec mitiga; atualização é responsabilidade do pipeline CI |

---

### Gates Necessários

| Gate | Decisor | Critério de aprovação |
|------|---------|----------------------|
| **Gate 1 (Arquitetural)** | Tech Lead + Arquiteto | ADRs FE-01 a FE-05 aprovados; OpenAPI spec disponível |
| **Gate 2 (LGPD — obrigatório)** | Tech Lead + DPO | Fluxo de autenticação/autorização revisado; nenhum dado pessoal exposto sem controle |
| **Gate 3 (Code Review)** | Tech Lead | PR do DOM-04 revisado; cobertura ≥ 80% em componentes de RN; zero violação de fronteira de módulo |
| **Gate 4 (Homologação)** | QA + PO | Fluxos críticos (transações, orçamento, relatório) homologados em ambiente de staging |

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-02-26 | Arquiteto Corporativo | Criação do plano |
