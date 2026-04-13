import { useState } from 'react'
import { Card, Flex } from '@tinkerbells/xenon-ui'

import { routes } from '@/shared/routes'
import { Editor } from '@/shared/ui/editor'

import cls from './editorPage.module.scss'

export default function EditorPage() {
  const [content, updateContent] = useState('<h2 style="text-align: center;">Добро пожаловать в React Boilerplate</h2><p><code>React Boilerplate</code> – это комплексное решение для быстрой разработки React приложений с использованием современных технологий. Проект построен на основе <a href="https://github.com/antfu/eslint-config" rel="noopener noreferrer" target="_blank">Feature-Sliced Design</a> архитектуры и включает в себя все необходимые инструменты для профессиональной разработки:</p><ul><li><strong>React 18 + TypeScript</strong> - основа фронтенда с строгой типизацией</li><li><strong>Vite 7</strong> - быстрый сборщик и dev-сервер</li><li><code>Redux Toolkit + RTK Query</code> - управление состоянием и API запросами</li><li><em>React Router v6</em> - современная маршрутизация</li><li><u>React Hook Form + Zod</u> - управление формами и валидация</li><li>SCSS с модульной системой и <code>CSS Modules</code></li><li><strong>ESLint + Stylelint</strong> - контроль качества кода</li><li>Поддержка множественных окружений: <code>development</code>, <code>test</code>, <code>pruv</code>, <code>kaodev</code>, <code>production</code></li><li>Автоматическая архивация сборок с датой</li><li>И многие другие <a href="https://github.com/antfu/eslint-config" target="_blank" rel="noopener noreferrer">современные инструменты</a></li></ul><p>Проект следует принципам <strong>Feature-Sliced Design (FSD)</strong> с четким разделением на слои: <code>app</code>, <code>entities</code>, <code>features</code>, <code>pages</code>, <code>shared</code> и <code>widgets</code>. Каждая фича содержит свою модель, UI компоненты, API слой и утилиты.</p><p>Основные команды для работы:</p><ul><li><code>npm run dev</code> - запуск dev-сервера</li><li><code>npm run build</code> - сборка для production</li><li><code>npm run lint</code> - проверка кода</li><li><code>npm run zip</code> - создание архива сборки</li></ul>')
  return (
    <Flex align="center" justify="center" className={cls.editorPage}>
      <Card title={routes.editor.title} size="small" className={cls.card}>
        <Editor content={content} onUpdate={updateContent} />
      </Card>
    </Flex>
  )
}
