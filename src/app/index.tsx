import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { env } from '@/shared/lib/env'

import { App } from './app'

function ensureHashRouting() {
  // Приложение использует `createHashRouter`, но пользователи могут открыть ссылку без `#`
  // Исправляем URL один раз на старте, перенося путь в hash.
  const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL : `${env.BASE_URL}/`

  const { pathname, search, hash } = window.location
  if (hash && hash.startsWith('#/'))
    return

  if (pathname === baseUrl.slice(0, -1))
    return

  if (!pathname.startsWith(baseUrl))
    return

  const rest = pathname.slice(baseUrl.length)
  if (!rest)
    return

  const normalized = rest.startsWith('/') ? rest : `/${rest}`
  window.history.replaceState(null, '', `${baseUrl}#${normalized}${search}`)
}

ensureHashRouting()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
