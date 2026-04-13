import { env } from '@/shared/lib/env'

const isDevelopment = env.NODE_ENV === 'development'

export function logError(
  error: Error,
  info: { componentStack?: string | null },
) {
  if (isDevelopment) {
    console.log('Caught error:', error)
    console.log('Error details:', info)
  }
  else {
    // Log error to an external service in production
  }
}
