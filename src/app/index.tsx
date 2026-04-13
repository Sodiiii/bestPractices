import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { env } from '@/shared/lib/env'

import { App } from './app'

async function enableMocking() {
  if (!env.APP_OFFLINE) {
    return
  }

  const { worker } = await import('./mocks/browser')

  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
