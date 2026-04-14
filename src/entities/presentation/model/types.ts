import type { ComponentType } from 'react'

export type PresentationSlideKind = 'basic' | 'sequence' | 'selector' | 'hybrid'

export type PresentationNextTargetKind = 'project' | 'section'

export type PresentationMediaKind = 'image' | 'widget'

export type PresentationWidgetKey = 'analyticsDashboard'

export type PresentationMediaObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

export type PresentationHomeCardImageVariant
  = | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
    | 'center'
    | 'left'
    | 'bottom'
    | 'right'

export interface PresentationHomeCardConfig {
  /** Короткий заголовок карточки на главном экране. */
  title: string
  /** Дополнительный текст карточки или подзаголовок. */
  description?: string
  /** Абсолютный путь до изображения карточки из public. */
  imagePath?: string
  /** Настройки раскладки изображения внутри карточки на главной странице. */
  imageLayout?: PresentationHomeCardImageLayout
  /** Текст CTA внутри карточки или под ней. */
  ctaLabel?: string
  /** Визуальный размер карточки в сетке главной страницы. */
  size: 'hero' | 'wide' | 'tall' | 'compact'
}

export interface PresentationHomeCardImageLayout {
  /** Готовый вариант позиционирования изображения внутри карточки. */
  variant: PresentationHomeCardImageVariant
  /** Масштаб изображения относительно базового размера. */
  scale?: number
  /** Смещение изображения по оси X в пикселях. */
  offsetX?: number
  /** Смещение изображения по оси Y в пикселях. */
  offsetY?: number
  /** Поворот изображения в градусах. */
  rotateDeg?: number
}

export interface PresentationMediaContent {
  /** Тип левого контента: изображение или интерактивный виджет. */
  kind: PresentationMediaKind
  /** Абсолютный путь до изображения из public. */
  imagePath?: string
  /** Режим object-fit для изображений на слайдах. */
  objectFit?: PresentationMediaObjectFit
  /** Ключ React-компонента из widget registry. */
  widgetKey?: PresentationWidgetKey
}

export interface PresentationStepConfig {
  /** Уникальный идентификатор шага внутри слайда. */
  id: string
  /** Заголовок шага для selector/hybrid кнопок. */
  title: string
  /** Заголовок проекта или подпись справа. */
  projectTitle: string
  /** Ссылка на проект, отображаемая рядом с projectTitle. */
  projectUrl?: string
  /** Основное описание текущего шага. */
  description: string
  /** Длительность шага в миллисекундах. */
  durationMs: number
  /** Контент, который нужно показать слева. */
  media: PresentationMediaContent
  /** Альтернативный текст для изображения, если шаг визуальный. */
  imageAlt?: string
  /** Текст кнопки шага справа для selector/hybrid. */
  buttonLabel?: string
}

export interface PresentationNextTarget {
  /** Тип следующего перехода для подписи основной CTA-кнопки. */
  kind: PresentationNextTargetKind
  /** Короткий лейбл основной кнопки. */
  label: string
  /** Дополнительное пояснение о следующем экране. */
  description: string
  /** Идентификатор следующего верхнеуровневого слайда. */
  targetSlideId: string
}

export interface PresentationPrimaryAction {
  /** Тип следующего действия для основной CTA-кнопки. */
  kind: PresentationNextTargetKind
  /** Основной текст CTA-кнопки. */
  label: string
  /** Поясняющий текст под основным label. */
  description: string
  /** Флаг, что действие переключает внутренний шаг текущего слайда. */
  isInternalStep: boolean
  /** Индекс шага, на который нужно перейти внутри текущего слайда. */
  targetStepIndex?: number
  /** Идентификатор следующего верхнеуровневого слайда. */
  targetSlideId?: string
}

export interface PresentationInternalStepCtaConfig {
  /** Основной текст CTA для внутренних переходов между шагами. */
  label?: string
  /** Дополнительная строка под основным label. */
  description?: string
  /** Флаг принудительного скрытия второй строки. */
  hideDescription?: boolean
}

export interface PresentationSecondaryAction {
  /** Основной текст вторичной кнопки. */
  label: string
  /** Флаг, что действие переключает внутренний шаг текущего слайда. */
  isInternalStep: boolean
  /** Индекс шага, на который нужно перейти внутри текущего слайда. */
  targetStepIndex?: number
  /** Идентификатор верхнеуровневого слайда для внешнего перехода назад. */
  targetSlideId?: string
}

export interface PresentationSlideBaseConfig {
  /** Уникальный идентификатор верхнеуровневого слайда. */
  id: string
  /** Идентификатор раздела, к которому относится слайд. */
  sectionId: string
  /** Тип слайда, влияющий на composition правой панели. */
  kind: PresentationSlideKind
  /** Общий заголовок слайда. */
  title: string
  /** Подпись над описанием в правой панели. */
  infoLabel?: string
  /** Заголовок блока кнопок под-слайдов в правой панели. */
  stepButtonsTitle?: string
  /** Флаг показа верхней info-card в правой панели. */
  showInfoCard?: boolean
  /** Настройка текста CTA для внутренних переходов между шагами sequence. */
  internalStepCta?: PresentationInternalStepCtaConfig
  /** Конфигурация карточки этого слайда на главном экране. */
  homeCard: PresentationHomeCardConfig
  /** Пошаговый контент слайда. Для basic содержит один шаг. */
  steps: PresentationStepConfig[]
  /** Метаданные перехода на следующий верхнеуровневый слайд. */
  next?: PresentationNextTarget
}

export interface PresentationBasicSlideConfig extends PresentationSlideBaseConfig {
  /** Базовый одиночный слайд. */
  kind: 'basic'
}

export interface PresentationSequenceSlideConfig extends PresentationSlideBaseConfig {
  /** Последовательный слайд с автопереходом между шагами. */
  kind: 'sequence'
}

export interface PresentationSelectorSlideConfig extends PresentationSlideBaseConfig {
  /** Слайд, где шаги выбираются кнопками справа. */
  kind: 'selector'
}

export interface PresentationHybridSlideConfig extends PresentationSlideBaseConfig {
  /** Слайд со счётчиком и кнопками шагов одновременно. */
  kind: 'hybrid'
}

export type PresentationSlideConfig
  = | PresentationBasicSlideConfig
    | PresentationSequenceSlideConfig
    | PresentationSelectorSlideConfig
    | PresentationHybridSlideConfig

export interface PresentationSectionConfig {
  /** Уникальный идентификатор раздела. */
  id: string
  /** Название раздела на главном экране. */
  title: string
  /** Описание раздела на главном экране. */
  description: string
  /** Идентификатор стартового слайда раздела. */
  startSlideId: string
}

export interface PresentationDeckConfig {
  /** Название всей презентации. */
  title: string
  /** Подзаголовок главного экрана. */
  subtitle: string
  /** Подпись над CTA-кнопкой на главном экране. */
  leadCaption: string
  /** Глобальная настройка автозапуска на страницах слайдов. */
  autoplay: boolean
  /** Длительность паузы после заполнения прогресса перед автопереходом. */
  transitionHoldMs: number
  /** Список разделов презентации. */
  sections: PresentationSectionConfig[]
  /** Плоский список верхнеуровневых слайдов в порядке показа. */
  slides: PresentationSlideConfig[]
}

export interface PresentationResolvedMedia {
  /** Тип контента после разрешения registry. */
  kind: PresentationMediaKind
  /** Абсолютный или собранный src изображения. */
  src?: string
  /** Режим object-fit для изображений на слайдах. */
  objectFit?: PresentationMediaObjectFit
  /** React-компонент интерактивного виджета. */
  component?: ComponentType
  /** Альтернативный текст изображения. */
  alt: string
}
