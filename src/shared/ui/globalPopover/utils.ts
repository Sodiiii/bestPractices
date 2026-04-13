import type { VirtualAnchor } from './types'

/** Список фокусируемых элементов внутри узла (для простого trapFocus) */
export function getFocusables(root: HTMLElement | null): HTMLElement[] {
  if (!root)
    return []
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')
  return Array.from(root.querySelectorAll<HTMLElement>(selector))
}

/** Создать виртуальный якорь по координатам точки экрана (fixed) */
export function createPointAnchor(x: number, y: number): VirtualAnchor {
  return { getBoundingClientRect: () => new DOMRect(x, y, 0, 0) }
}

export function isInKeepOpenZone(target: EventTarget | null) {
  return target instanceof Element
    && !!target.closest('[data-keep-open], [data-popover-keep], [data-interactive]')
}
