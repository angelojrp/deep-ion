import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import App from './App'
import './index.css'
import { i18n } from '@shared/i18n'

const queryClient = new QueryClient()

const start = async (): Promise<void> => {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('@infrastructure/api/mocks/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>
  )
}

void start()