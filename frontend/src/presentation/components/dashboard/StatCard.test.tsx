import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Active Demands" value={41} />)
    expect(screen.getByText('Active Demands')).toBeInTheDocument()
    expect(screen.getByText('41')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <StatCard
        label="Blocked"
        value={3}
        icon={<span data-testid="icon">!</span>}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders trend label when trend is provided', () => {
    render(
      <StatCard label="Flow" value="42%" trend="up" trendLabel="+5%" />,
    )
    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('does not render trend label when trend is absent', () => {
    render(<StatCard label="Flow" value="42%" trendLabel="+5%" />)
    expect(screen.queryByText('+5%')).not.toBeInTheDocument()
  })

  it('applies variant styles for success', () => {
    const { container } = render(
      <StatCard label="OK" value={0} variant="success" />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('bg-success-light')
  })

  it('applies variant styles for error', () => {
    const { container } = render(
      <StatCard label="Fail" value={5} variant="error" />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('bg-error-light')
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard label="Custom" value={1} className="my-custom" />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('my-custom')
  })
})
