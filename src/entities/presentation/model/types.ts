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
  /** Абсолютный путь до изображения карточки из public. */
  imagePath?: string
  /** Настройки раскладки изображения внутри карточки на главной странице. */
  imageLayout?: PresentationHomeCardImageLayout
  /** Визуальный размер карточки в сетке главной страницы. */
  size: 'wide' | 'compact'
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

export interface PresentationImageMediaContent {
  /** Тип левого контента: изображение или интерактивный виджет. */
  kind: 'image'
  /** Абсолютный путь до изображения из public. */
  imagePath: string
  /** Режим object-fit для изображений на слайдах. */
  objectFit?: PresentationMediaObjectFit
}

export interface PresentationWidgetMediaContent {
  /** Тип левого контента: изображение или интерактивный виджет. */
  kind: 'widget'
  /** Ключ React-компонента из widget registry. */
  widgetKey: PresentationWidgetKey
}

export type PresentationMediaContent = PresentationImageMediaContent | PresentationWidgetMediaContent

export interface PresentationStepBaseConfig {
  /** Уникальный идентификатор шага внутри слайда. */
  id: string
  /** Длительность шага в миллисекундах. */
  durationMs: number
  /** Контент, который нужно показать слева. */
  media: PresentationMediaContent
  /** Альтернативный текст для изображения, если шаг визуальный. */
  imageAlt?: string
}

export interface PresentationContentStepConfig extends PresentationStepBaseConfig {
  /** Необязательный заголовок шага, если он нужен конкретному UI-режиму. */
  title?: string
  /** Заголовок проекта или подпись справа. */
  projectTitle: string
  /** Ссылка на проект, отображаемая рядом с projectTitle. */
  projectUrl?: string
  /** Основное описание текущего шага, если правой панели нужно показать detail-card. */
  description?: string
  /** Content-step не отображается в кнопках selector-режима. */
  buttonLabel?: never
}

export interface PresentationSelectorStepConfig extends PresentationStepBaseConfig {
  /** Заголовок шага и fallback для кнопки. */
  title: string
  /** Текст кнопки шага справа. */
  buttonLabel: string
  /** Selector-шаг обязан иметь осмысленный alt, потому что не содержит projectTitle. */
  imageAlt: string
  /** Selector-step не рендерит project info-card. */
  projectTitle?: never
  /** Selector-step не рендерит description-card. */
  description?: never
  /** Selector-step не показывает ссылку на проект. */
  projectUrl?: never
}

export interface PresentationHybridStepConfig extends PresentationStepBaseConfig {
  /** Заголовок шага для кнопки/fallback. */
  title: string
  /** Заголовок проекта или подпись справа. */
  projectTitle: string
  /** Ссылка на проект, отображаемая рядом с projectTitle. */
  projectUrl?: string
  /** Основное описание текущего шага, если правой панели нужно показать detail-card. */
  description?: string
  /** Текст кнопки шага справа для hybrid-режима. */
  buttonLabel: string
}

export type PresentationStepConfig
  = | PresentationContentStepConfig
    | PresentationSelectorStepConfig
    | PresentationHybridStepConfig

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

export interface PresentationSlideCommonConfig {
  /** Уникальный идентификатор верхнеуровневого слайда. */
  id: string
  /** Идентификатор раздела, к которому относится слайд. */
  sectionId: string
  /** Общий заголовок слайда. */
  title: string
  /** Конфигурация карточки этого слайда на главном экране. */
  homeCard: PresentationHomeCardConfig
  /** Метаданные перехода на следующий верхнеуровневый слайд. */
  next?: PresentationNextTarget
}

export interface PresentationBasicSlideConfig extends PresentationSlideCommonConfig {
  /** Базовый одиночный слайд. */
  kind: 'basic'
  /** Подпись над описанием в правой панели. */
  infoLabel?: string
  /** Basic-слайд содержит ровно один content-step. */
  steps: [PresentationContentStepConfig]
  stepButtonsTitle?: never
  showInfoCard?: never
  internalStepCta?: never
}

export interface PresentationSequenceSlideConfig extends PresentationSlideCommonConfig {
  /** Последовательный слайд с автопереходом между шагами. */
  kind: 'sequence'
  /** Подпись над описанием в правой панели. */
  infoLabel?: string
  /** Настройка текста CTA для внутренних переходов между шагами sequence. */
  internalStepCta?: PresentationInternalStepCtaConfig
  /** Последовательный набор content-step. */
  steps: PresentationContentStepConfig[]
  stepButtonsTitle?: never
  showInfoCard?: never
}

export interface PresentationSelectorSlideConfig extends PresentationSlideCommonConfig {
  /** Слайд с кнопками выбора шагов, которые также участвуют в общем autoplay/progress сценарии. */
  kind: 'selector'
  /** Заголовок блока кнопок под-слайдов в правой панели. */
  stepButtonsTitle: string
  /** Управляемые кнопками selector-step без project info-card. */
  steps: PresentationSelectorStepConfig[]
  infoLabel?: never
  showInfoCard?: never
  internalStepCta?: never
}

export interface PresentationHybridSlideConfig extends PresentationSlideCommonConfig {
  /** Слайд со счётчиком и кнопками шагов одновременно. */
  kind: 'hybrid'
  /** Подпись над описанием в правой панели. */
  infoLabel?: string
  /** Заголовок блока кнопок под-слайдов в правой панели. */
  stepButtonsTitle: string
  /** Флаг показа верхней info-card в правой панели. */
  showInfoCard?: boolean
  /** Настройка текста CTA для внутренних переходов между шагами. */
  internalStepCta?: PresentationInternalStepCtaConfig
  /** Content-step с обязательными button labels. */
  steps: PresentationHybridStepConfig[]
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
