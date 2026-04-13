import React, { useCallback, useRef } from 'react'

import type { GlobalPopoverContent, Placement } from './types'

import { createPointAnchor } from './utils'
import { useGlobalPopover } from './context'

/**
 * Обёртка-триггер: открывает глобальный поповер по клику / ховеру / контекстному меню.
 * Удобно для иконок, кнопок, элементов таблиц и т. п.
 */
export const GlobalPopoverTrigger: React.FC<{
  content: GlobalPopoverContent
  openOn?: 'click' | 'contextmenu' | 'hover'
  placement?: Placement
  offset?: number
  arrow?: boolean
  trapFocus?: boolean
  matchAnchorWidth?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>> = ({
  content,
  openOn = 'click',
  placement = 'bottom-start',
  offset = 8,
  arrow = true,
  trapFocus = false,
  matchAnchorWidth = false,
  className,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const pop = useGlobalPopover()

  const open = useCallback((x?: number, y?: number) => {
    pop.open({
      anchor: x != null && y != null ? createPointAnchor(x, y) : ref.current,
      placement,
      offset,
      arrow,
      trapFocus,
      matchAnchorWidth,
      content,
    })
  }, [pop, placement, offset, arrow, trapFocus, matchAnchorWidth, content])

  const handlers: React.HTMLAttributes<HTMLDivElement> = {}
  if (openOn === 'click')
    handlers.onClick = () => open()
  if (openOn === 'hover')
    handlers.onMouseEnter = () => open()
  if (openOn === 'contextmenu') {
    handlers.onContextMenu = (e) => {
      e.preventDefault()
      open(e.clientX, e.clientY)
    }
  }

  return (
    <div ref={ref} className={className} {...handlers} {...rest}>
      {children}
    </div>
  )
}
