import type { RouteObject } from 'react-router'

import { routes } from '@/shared/routes'

export const slidePageRoute: RouteObject = {
  path: routes.slide.path,
  lazy: async () => {
    const page = await import('./slidePage').then(module => module.SlidePage)
    return { Component: page }
  },
}
