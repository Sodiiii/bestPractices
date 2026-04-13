import { Flex, Typography } from '@tinkerbells/xenon-ui'

import cls from './homePage.module.scss'

export default function HomePage() {
  return (
    <Flex align="center" justify="center" className={cls.homePage}>
      <div className={cls.intro}>
        <Typography level="heading1" className={cls.title}>
          React Boilerplate -&nbsp;
        </Typography>
        <Typography level="heading2" className={cls.subtitle}>
          Современный стартер для React приложений
        </Typography>

        <div className={cls.features}>
          <div className={cls.feature}>
            <Typography level="heading3">🚀 Современный стек:&nbsp;</Typography>
            <Typography level="heading5">React 18, TypeScript, Vite 7, Redux Toolkit</Typography>
          </div>

          <div className={cls.feature}>
            <Typography level="heading3">🏗️ FSD архитектура:&nbsp;</Typography>
            <Typography level="heading5">Feature-Sliced Design для масштабируемости</Typography>
          </div>

          <div className={cls.feature}>
            <Typography level="heading3">🎨 Готовые компоненты:&nbsp;</Typography>
            <Typography level="heading5">Xenon UI, SCSS модули, адаптивная верстка</Typography>
          </div>

          <div className={cls.feature}>
            <Typography level="heading3">⚡ Быстрая разработка:&nbsp;</Typography>
            <Typography level="heading5">Hot reload, TypeScript, ESLint, автоматическая сборка</Typography>
          </div>

          <div className={cls.feature}>
            <Typography level="heading3">🔧 Множественные окружения:&nbsp;</Typography>
            <Typography level="heading5">Development, test, pruv, kaodev, production</Typography>
          </div>

          <div className={cls.feature}>
            <Typography level="heading3">📦 Готовая структура:&nbsp;</Typography>
            <Typography level="heading5">Формы, таблицы, роутинг, состояние, API клиент</Typography>
          </div>
        </div>
      </div>
    </Flex>
  )
}
