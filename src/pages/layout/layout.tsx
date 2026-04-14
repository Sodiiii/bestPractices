import { Outlet } from 'react-router'
import { App } from '@tinkerbells/xenon-ui'

import cls from './layout.module.scss'

export function Layout() {
  return (
    <App notification={{ placement: 'bottomRight', maxCount: 3 }}>
      <main className={cls.layout}>
        <Outlet />
      </main>
    </App>
  )
}
