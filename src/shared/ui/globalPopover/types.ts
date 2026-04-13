import type React from 'react'

/**
 * Куда располагать поповер относительно якоря/точки.
 */
export type Placement
  = | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/** Содержимое поповера: ReactNode или функция-рендер проп с коллбеком закрытия */
export type GlobalPopoverContent = React.ReactNode | ((close: () => void) => React.ReactNode)

/** Виртуальный якорь — достаточно уметь вернуть bounding rect */
export interface VirtualAnchor { getBoundingClientRect: () => DOMRect }

/** Параметры открытия поповера (императивно/через хук) */
export interface GlobalPopoverOpenOptions {
  /** DOM-узел для привязки */
  anchor?: HTMLElement | VirtualAnchor | null
  /** Абсолютные координаты (fixed) вместо anchor */
  at?: { x: number, y: number }
  /** Предпочитаемое расположение */
  placement?: Placement
  /** Отступ от якоря в пикселях */
  offset?: number
  /** Рисовать «стрелочку» */
  arrow?: boolean
  /** Ловушка фокуса внутри поповера */
  trapFocus?: boolean
  /** Запрет закрытия кликом вне */
  disableOutsideClose?: boolean
  /** Ширина под размер якоря (меню/инпуты) */
  matchAnchorWidth?: boolean
  /** Максимальная ширина */
  maxWidth?: number | string
  /** Коллбек после полного закрытия */
  onClose?: () => void
  /** Z-index слоя */
  zIndex?: number
  /** Содержимое */
  content: GlobalPopoverContent
  /** Классы для внешней обёртки и корня слоя (необязательно) */
  classNames?: { wrapper?: string, root?: string }
}

/** Внутреннее состояние провайдера */
export interface State {
  isOpen: boolean
  content: GlobalPopoverContent | null
  anchor: HTMLElement | VirtualAnchor | null
  at: { x: number, y: number } | null

  placement: Placement
  offset: number
  arrow: boolean
  trapFocus: boolean
  disableOutsideClose: boolean
  matchAnchorWidth: boolean

  maxWidth?: number | string
  zIndex: number
  onClose?: () => void

  classNames?: { wrapper?: string, root?: string }
}

/** Императивный контроллер — то, что отдаём в контекст и наружу */
export interface PopoverController {
  open: (opts: GlobalPopoverOpenOptions) => void
  close: () => void
  update: (opts: Partial<GlobalPopoverOpenOptions>) => void
  isOpen: () => boolean
}
