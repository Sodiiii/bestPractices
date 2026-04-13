import { Header as $Header, Flex, ThemePicker } from '@tinkerbells/xenon-ui'

import { Navbar } from './navbar'
import cls from './header.module.scss'

export function Header() {
  return (
    <$Header className={cls.header}>
      <Navbar className={cls.navbar} />
      <Flex align="center" gap="middle">
        <ThemePicker />
      </Flex>
    </$Header>
  )
}
