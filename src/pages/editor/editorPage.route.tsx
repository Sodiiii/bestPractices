import type { RouteObject } from 'react-router'

import { routes } from '@/shared/routes'
import { withDocumentTitle } from '@/shared/ui/hocs/withDocumentTitle.tsx'

export const editorPageRoute: RouteObject = {
  path: routes.editor.path,
  lazy: async () => {
    const page = await import('./editorPage.tsx').then(module => module.default)
    const Component = withDocumentTitle(page, { title: routes.editor.title })
    return { Component }
  },
}
