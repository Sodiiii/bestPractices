import type { PresentationMediaContent, PresentationResolvedMedia, PresentationWidgetKey } from './types'

import { DemoDashboardWidget } from '../ui/demoDashboardWidget'

function getBaseUrl() {
  return import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
}

/**
 * Нормализует путь до public-ассета с учётом vite base.
 */
export function resolvePresentationAssetPath(assetPath: string) {
  const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath
  return `${getBaseUrl()}${normalizedPath}`
}

export const presentationLogoPath = resolvePresentationAssetPath('/presentation/images/gazpromInform.svg')

export const presentationWidgetRegistry: Record<PresentationWidgetKey, typeof DemoDashboardWidget> = {
  analyticsDashboard: DemoDashboardWidget,
}

/**
 * Разрешает ссылку на медиа-контент из type-safe registry.
 * Алгоритм:
 * 1. Смотрит тип источника.
 * 2. Для изображения использует прямой путь из конфига.
 * 3. Для виджета достаёт React-компонент из widget registry.
 * 4. Возвращает унифицированную структуру для UI shell.
 */
export function resolvePresentationMedia(media: PresentationMediaContent, fallbackAlt: string): PresentationResolvedMedia {
  if (media.kind === 'widget') {
    return {
      kind: 'widget',
      component: presentationWidgetRegistry[media.widgetKey],
      alt: fallbackAlt,
    }
  }

  return {
    kind: 'image',
    src: resolvePresentationAssetPath(media.imagePath),
    objectFit: media.objectFit,
    alt: fallbackAlt,
  }
}
