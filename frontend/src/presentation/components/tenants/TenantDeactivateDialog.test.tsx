import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TenantDeactivateDialog } from './TenantDeactivateDialog'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'tenants.deactivate.title': 'Desativar Tenant',
        'tenants.deactivate.confirm': 'Desativar Tenant',
        'tenants.deactivate.confirming': 'Desativando...',
        'tenants.deactivate.cancel': 'Cancelar',
        'tenants.deactivate.warning': `Desativar invalidará sessões dos ${params?.count ?? 0} membros.`,
        'tenants.deactivate.message': `Desativar <strong>${params?.name ?? ''}</strong>?`,
        'tenants.error.deactivate': 'Erro ao desativar.',
      }
      return map[key] ?? key
    },
    i18n: { language: 'pt-BR' },
  }),
}))

describe('TenantDeactivateDialog', () => {
  const defaultProps = {
    open: true,
    tenantName: 'ACME Corp',
    membersCount: 12,
    onConfirm: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  }

  it('renders when open', () => {
    render(<TenantDeactivateDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getAllByText('Desativar Tenant')).toHaveLength(2) // title + button
  })

  it('does not render when closed', () => {
    render(<TenantDeactivateDialog {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows tenant name in message', () => {
    render(<TenantDeactivateDialog {...defaultProps} />)
    expect(screen.getByText('ACME Corp')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<TenantDeactivateDialog {...defaultProps} />)
    await user.click(screen.getByText('Cancelar'))
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    render(<TenantDeactivateDialog {...defaultProps} />)
    const confirmButtons = screen.getAllByText('Desativar Tenant')
    // Click the button (not the title)
    await user.click(confirmButtons[confirmButtons.length - 1])
    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('has aria-modal attribute', () => {
    render(<TenantDeactivateDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
