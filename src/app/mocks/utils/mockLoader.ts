import type { RequestHandler } from 'msw'

/**
 * Автоматически загружает все моки из __mocks__ папок
 */
export function loadMocks(): RequestHandler[] {
  const mockModules = import.meta.glob([
    '../../../**/__mocks__/**/*.mock.ts',
    '../../../**/__mocks__/**/*.mock.js',
  ], { eager: true })

  const handlers: RequestHandler[] = []

  for (const mockModule of Object.values(mockModules)) {
    const module = mockModule as { handlers?: RequestHandler[], default?: RequestHandler[] }

    if (module.handlers) {
      handlers.push(...module.handlers)
    }
    else if (module.default) {
      handlers.push(...module.default)
    }
  }

  return handlers
}
