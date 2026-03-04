## Plan: Frontend React SPA — Scaffold do Zero

O objetivo é criar a estrutura completa do projeto `frontend/` seguindo rigorosamente o blueprint [architecture/blueprints/frontend-react-spa.yaml](architecture/blueprints/frontend-react-spa.yaml), sem referência ao `frontend-bk/`. O scaffold inclui: configuração de projeto (Vite + TS + Tailwind v4), arquitetura de camadas, design system base (shadcn/ui), i18n, MSW mocks, roteamento com lazy loading, e a estrutura preparada para o primeiro módulo (Tenants). Todos os padrões — layer isolation, named exports, path aliases, cn(), WCAG 2.1 AA — serão aplicados desde o primeiro arquivo.

**Steps**

1. **Inicializar projeto Vite + React + TypeScript** em `frontend/` via `npm create vite@latest . -- --template react-ts` e instalar dependências exatas (sem `^`/`~` para diretas): React 18, TypeScript 5, Tailwind CSS 4, react-router-dom 6, @tanstack/react-query 5, zustand 5, react-i18next 15, i18next, msw 2, vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, class-variance-authority, clsx, tailwind-merge

2. **Configurar TypeScript strict** em `tsconfig.json` — habilitar `strict`, `noImplicitAny`, `strictNullChecks`; configurar path aliases (`@presentation`, `@application`, `@domain`, `@infrastructure`, `@shared`, `@assets`)

3. **Configurar Vite** em `vite.config.ts` — resolver path aliases, configurar `manualChunks` para vendor splitting (react, react-dom, react-router, tanstack-query, zustand)

4. **Configurar Tailwind CSS v4** — `tailwind.config.ts` com design tokens (cores, spacing, breakpoints), `darkMode: 'class'`, integração com Vite via PostCSS

5. **Criar estrutura de diretórios** conforme blueprint:
   - `src/presentation/{components/{ui,layout},pages,routes}`
   - `src/application/{hooks,use-cases,stores}`
   - `src/domain/{models,errors,validators}`
   - `src/infrastructure/{api/{generated,adapters,mocks/fixtures},auth,http}`
   - `src/shared/{i18n,constants,utils,types}`
   - `src/assets/{images,fonts}`
   - `public/`

6. **Criar utilitários base** em `src/shared/utils/`:
   - `cn.ts` — clsx + tailwind-merge
   - `formatCurrency.ts` — BRL formatter via `Intl.NumberFormat`
   - `formatDate.ts` — dd/mm/yyyy via `Intl.DateTimeFormat`

7. **Configurar i18n** em `src/shared/i18n/index.ts` — i18next init com `pt-BR` default, fallback, namespaces (`common`, `errors`, `auth`); criar `pt-BR.json` e `en.json` com chaves iniciais de layout (sidebar, navigation, common actions)

8. **Criar constantes de rotas** em `src/shared/constants/ROUTES.ts` — paths tipados para Dashboard, Tenants (list, create, detail/:id), Config

9. **Configurar MSW** — `src/infrastructure/api/mocks/browser.ts` (setupWorker), `handlers.ts` (centralizador); inicializar no `main.tsx` apenas em dev

10. **Criar layout components** em `src/presentation/components/layout/`:
    - `AppShell.tsx` — container principal (sidebar + main content area)
    - `Sidebar.tsx` — navegação lateral fixa 220px (web), com items de menu tipados
    - `MobileNav.tsx` — bottom navigation com 3 itens (Dashboard, Tenants, Config)
    - `PageHeader.tsx` — título de página + breadcrumbs + ação primária

11. **Criar componentes UI base** via shadcn/ui (`npx shadcn@latest add`): Button, Input, Badge, Card, Dialog, Toast/Sonner, Skeleton, Switch/Toggle, Table, DropdownMenu, Label, Separator

12. **Configurar roteamento** em `src/presentation/routes/`:
    - `AppRouter.tsx` — lazy loading para todas as páginas + Suspense com fallback
    - `ProtectedRoute.tsx` — guard de autenticação (stub preparado para Keycloak)

13. **Criar Zustand store** para sidebar em `src/application/stores/sidebarStore.ts` — controle de open/close, persist para preferência

14. **Criar entry points**:
    - `src/main.tsx` — apenas providers: StrictMode, QueryClientProvider, I18nextProvider, RouterProvider; init MSW em dev
    - `src/App.tsx` — ErrorBoundary + AppRouter
    - `index.html` — minimal, carrega main.tsx

15. **Criar página placeholder** para Dashboard e Tenants em `src/presentation/pages/` com lazy loading — componentes mínimos que renderizam dentro do AppShell

16. **Configurar Vitest** em `vitest.config.ts` — dom environment (jsdom), setup file com @testing-library/jest-dom, coverage thresholds (80% lines)

17. **Criar `src/test/setup.ts`** — importar jest-dom matchers, configurar cleanup

18. **Criar `.env.example`** — documentar variáveis `VITE_API_BASE_URL`, `VITE_AUTH_URL`, `VITE_SENTRY_DSN`

19. **Configurar ESLint** — typescript-eslint, react-hooks, jsx-a11y; `--max-warnings 0`

20. **Validar** — executar `cd frontend && npm run dev` (deve renderizar o layout com sidebar), `npm run typecheck`, `npm run test`

**Verification**

- `cd frontend && npx tsc --noEmit` — zero erros de tipo
- `cd frontend && npx vitest run` — testes passam
- `cd frontend && npm run dev` — app renderiza com sidebar, navegação funcional, i18n em pt-BR
- Verificar que nenhum arquivo fora de `frontend/` foi criado
- Confirmar path aliases funcionam (imports com `@presentation/`, `@shared/` etc.)
- Confirmar layer isolation: `presentation/` não importa de `infrastructure/`

**Decisions**

- **Scaffold do zero** — sem copiar nada de `frontend-bk/`, sem migração de código existente
- **Mock-first** — MSW configurado desde o início, pronto para fixtures de Tenants
- **Layout-first** — AppShell + Sidebar + MobileNav como primeira entrega visual, validando o design system antes de implementar features
- **shadcn/ui via CLI** — componentes copiados pelo CLI oficial, não instalados como dependência
- **Versões exatas** — todas as dependências diretas com versão pinada (sem `^`/`~`)
