import { Flex, Typography } from '@tinkerbells/xenon-ui'

import cls from './notFound.module.scss'

export function NotFoundPage() {
  return (
    <Flex justify="center" align="center" className={cls.notFoundPage}>
      <Typography level="heading4">Страница не найдена</Typography>
    </Flex>
  )
}
