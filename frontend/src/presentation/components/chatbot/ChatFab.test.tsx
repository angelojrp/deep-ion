import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ChatFab } from './ChatFab'
import { useChatStore } from '@application/stores/useChatStore'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ChatFab', () => {
  beforeEach(() => {
    useChatStore.setState({ widgetOpen: false })
  })

  it('renders the floating button', () => {
    renderWithRouter(<ChatFab />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has correct aria-label when closed', () => {
    renderWithRouter(<ChatFab />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('toggles widget on click', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ChatFab />)

    await user.click(screen.getByRole('button'))
    expect(useChatStore.getState().widgetOpen).toBe(true)

    await user.click(screen.getByRole('button'))
    expect(useChatStore.getState().widgetOpen).toBe(false)
  })

  it('shows notification pulse when widget is closed', () => {
    renderWithRouter(<ChatFab />)
    // The pulse elements use aria-hidden="true"
    const pulseContainer = screen.getByRole('button').querySelector('[aria-hidden="true"]')
    expect(pulseContainer).toBeInTheDocument()
  })

  it('hides notification pulse when widget is open', () => {
    useChatStore.setState({ widgetOpen: true })
    renderWithRouter(<ChatFab />)
    // Pulse uses a span with animate-ping class — should not exist when open
    const pulseEl = screen.getByRole('button').querySelector('.animate-ping')
    expect(pulseEl).toBeNull()
  })
})
