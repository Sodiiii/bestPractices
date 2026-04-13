import type { RouteObject } from 'react-router'

import { routes } from '@/shared/routes'
import { withDocumentTitle } from '@/shared/ui/hocs/withDocumentTitle.tsx'

export const postPageRoute: RouteObject = {
  path: routes.post.root.path,
  lazy: async () => {
    const page = await import('./postPage.tsx').then(module => module.default)
    const Component = withDocumentTitle(page, { title: routes.post.root.title })
    return { Component }
  },
}
