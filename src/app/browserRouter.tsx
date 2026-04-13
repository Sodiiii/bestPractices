import { Spin } from '@tinkerbells/xenon-ui'
import { createHashRouter, RouterProvider } from 'react-router'

import { NotFoundPage } from '@/pages/not-found/notFound'
import { homePageRoute } from '@/pages/home/homePage.route'

import { routes } from '../shared/routes'
import { Layout } from '../pages/layout/layout'

const router = createHashRouter([
  {
    path: routes.root.path,
    element: <Layout />,
    hydrateFallbackElement: <Spin fullscreen />,
    children: [
      homePageRoute,
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function Router() {
  return (
    <RouterProvider router={router} />
  )
}
