import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

// i18n must be initialized for tests
import '@shared/i18n/index'

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('Sidebar', () => {
  it('renders navigation links', () => {
    renderWithRouter(<Sidebar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('menubar')).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    renderWithRouter(<Sidebar />)
    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems).toHaveLength(9)
  })

  it('renders app name', () => {
    renderWithRouter(<Sidebar />)
    expect(screen.getByText('deep-ion')).toBeInTheDocument()
  })
})

describe('BottomNav', () => {
  it('renders mobile navigation', () => {
    renderWithRouter(<BottomNav />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    renderWithRouter(<BottomNav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(6)
  })
})
