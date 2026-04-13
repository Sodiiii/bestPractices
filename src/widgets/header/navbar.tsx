import type { MenuProps } from '@tinkerbells/xenon-ui'

import { NavLink, useLocation } from 'react-router'
import { LogoPlaceholder, Menu } from '@tinkerbells/xenon-ui'

import { routes } from '@/shared/routes'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
  {
    icon: <NavLink to={routes.root.path}><LogoPlaceholder /></NavLink>,
    key: 'root',
  },
  {
    icon: <NavLink to={routes.home.path}>{ routes.home.title }</NavLink>,
    key: routes.home.title,
  },
  {
    icon: <NavLink to={routes.post.root.path}>{ routes.post.root.title }</NavLink>,
    key: routes.post.root.title,
  },
  {
    icon: <NavLink to={routes.editor.path}>{ routes.editor.title }</NavLink>,
    key: routes.editor.title,
  },
]

type NavbarProps = MenuProps

export function Navbar({ className }: NavbarProps) {
  const { pathname } = useLocation()

  const getSelectedKey = (pathname: string) => {
    if (pathname === routes.home.path)
      return routes.home.title
    if (pathname === routes.post.root.path)
      return routes.post.root.title
    if (pathname === routes.editor.path)
      return routes.editor.title
    if (pathname.startsWith(routes.post.root.path))
      return routes.post.root.title
    return routes.root.title
  }

  const current = getSelectedKey(pathname)

  return (
    <Menu
      className={className}
      mode="horizontal"
      items={items}
      selectedKeys={[current]}
    />
  )
}
