import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// i18n must be initialized before rendering
import '@shared/i18n/index'

import './index.css'
import { App } from './App'

async function bootstrap() {
  // Start MSW in development only
  if (import.meta.env.DEV) {
    const { worker } = await import('@infrastructure/api/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
