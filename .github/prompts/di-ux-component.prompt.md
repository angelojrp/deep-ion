```prompt
---
agent: ux-engineer
description: "Criar componente React reutilizável com shadcn/ui + Tailwind CSS v4 + TypeScript strict + i18n + a11y + testes"
name: "di-ux-component"
argument-hint: "Nome do componente e descrição funcional (ex: 'TransactionCard — card de transação com status badge e valor em BRL')"
---

Assuma o papel de **UX Engineer Frontend**.

> Objetivo: criar um componente React reutilizável, production-ready, seguindo o design system do projeto.

---

## Pré-condição

Antes de criar o componente:
1. Ler `architecture/blueprints/frontend-react-spa.yaml` para confirmar convenções
2. Verificar se componente similar já existe em `frontend/src/presentation/components/`
3. Verificar utilitários disponíveis em `frontend/src/shared/utils/`
4. Verificar se há componentes shadcn/ui base que podem ser estendidos

---

## Estrutura de Saída

Para cada componente, gerar os seguintes arquivos:

### 1. Componente principal
```
frontend/src/presentation/components/ui/{ComponentName}.tsx
```

### 2. Barrel export (se pasta dedicada)
```
frontend/src/presentation/components/ui/{ComponentName}/index.ts
```

### 3. Teste
```
frontend/src/presentation/components/ui/{ComponentName}.test.tsx
```

### 4. Chaves i18n (se necessário)
Adicionar chaves em `frontend/src/shared/i18n/`

---

## Checklist Obrigatório

- [ ] TypeScript strict — Props interface explícita, sem `any`
- [ ] `cn()` de `@shared/utils/cn` para merge de classes Tailwind
- [ ] CVA (class-variance-authority) para variants quando aplicável
- [ ] `useTranslation()` para todo texto visível ao usuário
- [ ] `aria-label` ou `aria-labelledby` em todo elemento interativo
- [ ] Suporte a `className` override via Props
- [ ] `React.forwardRef` quando wrapper de elemento nativo HTML
- [ ] `displayName` definido no componente
- [ ] Named exports only (sem `export default`)
- [ ] Testes: render, variants/states, acessibilidade, interações
- [ ] Preferir `screen.getByRole()` sobre `getByTestId()`

---

## Padrão de Componente

```tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils/cn'

const componentVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  /** props específicas */
}

const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, ...props }, ref) => {
    const { t } = useTranslation()

    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        aria-label={t('component.ariaLabel')}
        {...props}
      />
    )
  }
)
ComponentName.displayName = 'ComponentName'

export { ComponentName, componentVariants }
export type { ComponentNameProps }
```

---

## Padrão de Teste

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ComponentName } from './ComponentName'

// Wrapper com providers se necessário (i18n, etc.)

describe('ComponentName', () => {
  it('renders with default props', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<ComponentName variant="outline" />)
    // verificar classes aplicadas
  })

  it('merges custom className', () => {
    render(<ComponentName className="custom-class" />)
    // verificar merge
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<ComponentName ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct aria attributes', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...')).toHaveAttribute('aria-label')
  })
})
```

---

## Padrões Fintech Específicos

Quando o componente envolve dados financeiros:
- Moeda: usar `formatCurrency()` de `@shared/utils/formatCurrency`
- CPF: sempre mascarado (`***.***.XXX-XX`)
- Datas: usar `formatDate()` de `@shared/utils/formatDate`
- Status: badges semânticos (confirmada=green, pendente=yellow, cancelada=red)
- Saldo: cor condicional (positivo=green, negativo=red, zero=muted)

---

## Validação Final

Após criar todos os arquivos, executar:

```bash
cd frontend && npm run typecheck && npm run test -- --reporter=verbose
```

Corrigir qualquer erro antes de finalizar.
```
