```prompt
---
agent: ux-engineer
description: "Refatorar componente ou página React existente para conformidade com design system, acessibilidade, i18n e padrões do projeto"
name: "di-ux-refactor"
argument-hint: "Caminho do arquivo a refatorar (ex: 'frontend/src/presentation/pages/AgentDashboardPage.tsx')"
---

Assuma o papel de **UX Engineer Frontend**.

> Objetivo: refatorar um componente ou página existente para conformidade total com as convenções do projeto, sem alterar funcionalidade.

---

## Pré-condição

Antes de refatorar:
1. Ler o arquivo alvo completamente
2. Ler `architecture/blueprints/frontend-react-spa.yaml` para confirmar convenções
3. Verificar componentes reutilizáveis em `frontend/src/presentation/components/`
4. Verificar utilitários em `frontend/src/shared/utils/`
5. Verificar se há testes existentes para o arquivo

---

## Checklist de Auditoria

Avaliar o arquivo contra cada item. Corrigir todos os que falharem:

### Estrutura e Tipagem
- [ ] TypeScript strict — sem `any`, sem `@ts-ignore`
- [ ] Props interface explícita e nomeada `{ComponentName}Props`
- [ ] Named exports only (sem `export default`)
- [ ] `displayName` definido

### Design System
- [ ] `cn()` de `@shared/utils/cn` para merge de classes
- [ ] Sem cores/espaçamentos hardcoded — usar classes Tailwind/tokens
- [ ] Usar componentes shadcn/ui existentes onde disponível
- [ ] CVA para variants quando componente tem múltiplos estilos

### Internacionalização
- [ ] `useTranslation()` para todo texto visível ao usuário
- [ ] Sem strings hardcoded no JSX (exceto aria attributes técnicos)
- [ ] Chaves i18n adicionadas em `frontend/src/shared/i18n/`

### Acessibilidade (WCAG 2.1 AA)
- [ ] `aria-label` ou `aria-labelledby` em todo elemento interativo
- [ ] `role` appropriate em elementos semânticos
- [ ] Navegação por teclado funcional (Tab, Enter, Escape)
- [ ] Indicador de foco visível
- [ ] Alt text em imagens/ícones decorativos (`aria-hidden="true"`)
- [ ] Hierarquia de headings correta (sem pular níveis)
- [ ] Labels associados a inputs (`htmlFor` ou `aria-labelledby`)

### Isolamento de Camadas
- [ ] `presentation/` não importa de `infrastructure/` diretamente
- [ ] `domain/` sem imports de React ou frameworks
- [ ] Dados de API vêm via hooks da camada `application/`

### Estados da UI
- [ ] Loading state implementado (skeleton ou spinner)
- [ ] Error state com mensagem clara e ação de retry
- [ ] Empty state amigável com CTA
- [ ] Data state com dados populados

### Padrões Fintech
- [ ] Valores monetários formatados com `formatCurrency()` / `R$ X.XXX,XX`
- [ ] CPF mascarado (`***.***.XXX-XX`)
- [ ] Datas em `dd/mm/yyyy` via `formatDate()`
- [ ] Status com cores semânticas (confirmada=green, pendente=yellow, cancelada=red)
- [ ] Operações destrutivas com dialog de confirmação

---

## Processo de Refatoração

### Fase 1 — Diagnóstico

Listar todos os problemas encontrados no checklist em formato tabela:

| # | Categoria | Problema | Severidade | Linha(s) |
|---|---|---|---|---|
| 1 | a11y | Input sem aria-label | blocker | L45 |
| 2 | i18n | String hardcoded no JSX | warning | L67 |

### Fase 2 — Refatoração

Aplicar correções na seguinte ordem de prioridade:
1. **Blocker** — tipagem, acessibilidade crítica, isolamento de camadas
2. **Warning** — i18n, design tokens, componentes reutilizáveis
3. **Info** — displayName, convenções de estilo cosmético

### Fase 3 — Testes

- Atualizar testes existentes se assinatura de props mudou
- Adicionar testes faltantes para estados (loading, error, empty)
- Adicionar testes de acessibilidade se inexistentes

---

## Restrições

- **Não alterar funcionalidade** — apenas conformidade e qualidade
- **Não mudar nomes de componentes** que são importados por outros arquivos (verificar usages)
- **Manter compatibilidade** de Props (não remover props existentes, apenas adicionar)
- **Commits atômicos** — se a refatoração for grande, sugerir divisão

---

## Validação Final

Após refatorar, executar:

```bash
cd frontend && npm run typecheck && npm run lint && npm run test -- --reporter=verbose
```

Corrigir qualquer erro introduzido pela refatoração.

---

## Relatório de Saída

| Arquivo | Alterações | Problemas corrigidos |
|---|---|---|
| `{arquivo}` | descrição das mudanças | #1, #2, #5 |
| `{teste}` | testes adicionados/atualizados | cobertura de estados |
| `i18n/{locale}.json` | chaves adicionadas | #2 i18n |
```
