import { Spin } from '@tinkerbells/xenon-ui'
import { createHashRouter, RouterProvider } from 'react-router'

import { routes } from '@/shared/routes'
import { Layout } from '@/pages/layout/layout'
import { NotFoundPage } from '@/pages/not-found/notFound'
import { homePageRoute } from '@/pages/home/homePage.route'
import { slidePageRoute } from '@/pages/slide/slidePage.route'

const router = createHashRouter([
  {
    path: routes.root.path,
    element: <Layout />,
    hydrateFallbackElement: <Spin fullscreen />,
    children: [
      homePageRoute,
      slidePageRoute,
      {
        path: routes.page404.path,
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
