import { Outlet } from 'react-router'
import { Layout as $Layout, App } from '@tinkerbells/xenon-ui'

import { Header } from '@/widgets/header/header'

import cls from './layout.module.scss'

export function Layout() {
  return (
    <App notification={{ placement: 'bottomRight', maxCount: 3 }}>
      <$Layout className={cls.layout}>
        <Header />
        <Outlet />
      </$Layout>
    </App>
  )
}
