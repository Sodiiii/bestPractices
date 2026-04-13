import type { RouteObject } from 'react-router'

import { routes } from '@/shared/routes'
import { withDocumentTitle } from '@/shared/ui/hocs/withDocumentTitle'

export const homePageRoute: RouteObject = {
  path: routes.home.path,
  lazy: async () => {
    const page = await import('./homePage').then(module => module.default)
    const Component = withDocumentTitle(page, { title: routes.home.title })
    return { Component }
  },
}
