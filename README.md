# React Boilerplate

## Технологический стек

### Основные технологии

- **React 18** + **TypeScript** - основа фронтенда
- **Vite 7** - быстрый сборщик и dev-сервер
- **Redux Toolkit** + **RTK Query** - состояние и API запросы
- **React Router v6** - маршрутизация
- **React Hook Form** + **Zod** - управление формами и валидация

### Стилизация

- **SCSS** с модульной системой
- **CSS Modules** с camelCase конвенцией
- **@tinkerbells/xenon-ui** - UI компоненты

### Качество кода

- **ESLint** с конфигурацией [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- **Stylelint** для SCSS
- **Husky** + **Commitlint** для Git hooks

## Архитектура

Проект следует принципам **Feature-Sliced Design (FSD)**:

```
src/
├── app/           # Инициализация приложения
├── entities/      # Бизнес-сущности
├── features/      # Функциональные фичи
├── pages/         # Страницы приложения
├── shared/        # Переиспользуемые компоненты
└── widgets/       # Большие UI блоки
```

### Ключевые принципы

- **Слоевая архитектура** - четкое разделение ответственности
- **Изолированные модули** - каждая фича самодостаточна
- **Typed API** - строгая типизация с Zod схемами
- **Централизованное состояние** - Redux Toolkit с персистентностью
- **Код-конвенции** - единый стиль через ESLint правила

## Особенности конфигурации

### Сборка и окружение

- **Автоматическая сборка** через `build.sh` с определением имени проекта
- **Множественные окружения**: development, test, pruv, kaodev, production
- **Переменные окружения** через файлы `.env.*` для каждого режима
- CSS Modules с кастомными именами классов
- Алиасы путей через `@/` для `src/`
- Типизированные переменные окружения через `zod`
- Автоматическое создание zip-архивов сборок с датой

### Стилизация

- Строгие правила для SCSS переменных
- Автоматическая сортировка CSS свойств
- CamelCase для CSS классов

### Линтинг

- Сортировка импортов по длине строки
- Контроль именования файлов (camelCase)
- Предупреждения для console.log

## Команды

### Разработка
```bash
npm run dev        # Запуск dev-сервера
npm run lint       # Проверка кода
npm run lint:fix   # Исправление ошибок
```

### Сборка для разных окружений
```bash
npm run build                 # Сборка для production (по умолчанию)
npm run build-production     # Сборка для production
npm run build-test          # Сборка для test окружения
npm run build-pruv          # Сборка для pruv окружения
npm run build-kaodev        # Сборка для kaodev окружения
```

### Просмотр
```bash
npm run preview              # Просмотр production сборки
npm run preview-pruv         # Просмотр pruv сборки
npm run preview-kaodev       # Просмотр kaodev сборки
```

### Архивация
```bash
npm run zip        # Создание архива билда
```

## Конфигурация окружений

Проект поддерживает несколько окружений с отдельными настройками:

- `.env.development` - для разработки
- `.env.test` - для тестирования
- `.env.pruv` - для pruv окружения
- `.env.kaodev` - для kaodev окружения
- `.env.production` - для продакшна
- `.env.example` - шаблон переменных окружения

Каждое окружение может иметь свои настройки API, URL бэкенда и других параметров.

## Структура фичи

Каждая фича содержит:

- **Model** - Redux slice и типы
- **UI** - React компоненты
- **API** - RTK Query mutations/queries
- **Lib** - Утилиты и хуки

Пример структуры фичи:

```
features/post/createPost/
├── createPostModel.ts     # Redux slice
├── createPostMutation.ts  # RTK Query
├── createPostForm.tsx     # UI компонент
├── useCreatePostForm.ts   # Хук формы (выделение бизнес-логики, от UI)
└── *.module.scss         # Стили
```
