import { env } from '../lib/env'

// Определяем baseUrl в зависимости от режима работы
export const baseUrl = env.APP_OFFLINE
  ? 'http://localhost:5173/api' // Offline режим - используем моки через MSW
  : env.NODE_ENV !== 'development' ? env.BACKEND_URL : env.BACKEND_URL || 'http://localhost:3000/api' // Online режим - используем реальный API
