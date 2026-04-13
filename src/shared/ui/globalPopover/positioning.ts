import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import type { Placement, State } from './types'

/**
 * Хук вычисления координат поповера и стрелочки. Не зависит от внешних библиотек.
 * Поддерживает Chrome 109+: используем простые DOM API и requestAnimationFrame.
 */
export function useComputedPosition(
  state: State,
  popoverRef: React.RefObject<HTMLDivElement>,
): [{ top: number, left: number }, { top?: number, left?: number }, number | undefined] {
  const [pos, setPos] = useState({ top: -10000, left: -10000 })
  const [arrowPos, setArrowPos] = useState<{ top?: number, left?: number }>({})
  const [matchWidth, setMatchWidth] = useState<number | undefined>(undefined)

  const recalc = useCallback(() => {
    const viewportPadding = 8
    const offset = state.offset

    // 1) Определяем «якорь»: прямоугольник DOM-элемента, виртуального якоря или точку экрана
    let anchorRect: DOMRect | null = null
    if (state.at) {
      anchorRect = new DOMRect(state.at.x, state.at.y, 0, 0)
    }
    else if (state.anchor) {
      anchorRect = state.anchor.getBoundingClientRect()
    }

    const bodyW = window.innerWidth
    const bodyH = window.innerHeight

    // 2) Если якорь не задан, центрируем поповер по экрану (модалка-режим)
    if (!anchorRect) {
      const width = popoverRef.current?.offsetWidth ?? 300
      const height = popoverRef.current?.offsetHeight ?? 200
      setPos({ top: (bodyH - height) / 2, left: (bodyW - width) / 2 })
      setArrowPos({})
      setMatchWidth(undefined)
      return
    }

    // 3) Вычисляем позицию относительно якоря/точки
    const pp = computePosition(anchorRect, popoverRef.current, state.placement, offset, viewportPadding)
    setPos({ top: pp.top, left: pp.left })
    setArrowPos(state.arrow ? pp.arrow : {})
    setMatchWidth(state.matchAnchorWidth ? anchorRect.width : undefined)
  }, [state.anchor, state.at, state.placement, state.offset, state.arrow, state.matchAnchorWidth])

  // Первичный расчёт
  useLayoutEffect(() => {
    recalc()
  }, [recalc, state.isOpen])

  // Пересчёт при resize/scroll + один кадр после рендера
  useEffect(() => {
    if (!state.isOpen)
      return
    const onScroll = () => recalc()
    const onResize = () => recalc()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    const id = requestAnimationFrame(recalc)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [state.isOpen, recalc])

  return [pos, arrowPos, matchWidth]
}

/** Алгоритм позиционирования + простая коррекция выхода за вьюпорт */
export function computePosition(
  anchorRect: DOMRect,
  popEl: HTMLDivElement | null | undefined,
  placement: Placement,
  offset: number,
  viewportPadding: number,
) {
  const popW = popEl?.offsetWidth ?? 300
  const popH = popEl?.offsetHeight ?? 200

  const placements: Record<Placement, () => { top: number, left: number, arrow: { top?: number, left?: number } }> = {
    'bottom-start': () => ({
      top: anchorRect.bottom + offset,
      left: Math.max(viewportPadding, anchorRect.left),
      arrow: { top: anchorRect.bottom + offset - 5, left: anchorRect.left + 12 },
    }),
    'bottom-end': () => ({
      top: anchorRect.bottom + offset,
      left: Math.min(window.innerWidth - popW - viewportPadding, anchorRect.right - popW),
      arrow: { top: anchorRect.bottom + offset - 5, left: anchorRect.right - 22 },
    }),
    'bottom': () => ({
      top: anchorRect.bottom + offset,
      left: Math.round(anchorRect.left + anchorRect.width / 2 - popW / 2),
      arrow: { top: anchorRect.bottom + offset - 5, left: anchorRect.left + anchorRect.width / 2 - 5 },
    }),
    'top-start': () => ({
      top: anchorRect.top - popH - offset,
      left: Math.max(viewportPadding, anchorRect.left),
      arrow: { top: anchorRect.top - offset - 5, left: anchorRect.left + 12 },
    }),
    'top-end': () => ({
      top: anchorRect.top - popH - offset,
      left: Math.min(window.innerWidth - popW - viewportPadding, anchorRect.right - popW),
      arrow: { top: anchorRect.top - offset - 5, left: anchorRect.right - 22 },
    }),
    'top': () => ({
      top: anchorRect.top - popH - offset,
      left: Math.round(anchorRect.left + anchorRect.width / 2 - popW / 2),
      arrow: { top: anchorRect.top - offset - 5, left: anchorRect.left + anchorRect.width / 2 - 5 },
    }),
    'left-start': () => ({
      top: Math.max(viewportPadding, anchorRect.top),
      left: anchorRect.left - popW - offset,
      arrow: { top: anchorRect.top + 12, left: anchorRect.left - 5 },
    }),
    'left-end': () => ({
      top: Math.min(window.innerHeight - popH - viewportPadding, anchorRect.bottom - popH),
      left: anchorRect.left - popW - offset,
      arrow: { top: anchorRect.bottom - 22, left: anchorRect.left - 5 },
    }),
    'left': () => ({
      top: Math.round(anchorRect.top + anchorRect.height / 2 - popH / 2),
      left: anchorRect.left - popW - offset,
      arrow: { top: anchorRect.top + anchorRect.height / 2 - 5, left: anchorRect.left - 5 },
    }),
    'right-start': () => ({
      top: Math.max(viewportPadding, anchorRect.top),
      left: anchorRect.right + offset,
      arrow: { top: anchorRect.top + 12, left: anchorRect.right + offset - 5 },
    }),
    'right-end': () => ({
      top: Math.min(window.innerHeight - popH - viewportPadding, anchorRect.bottom - popH),
      left: anchorRect.right + offset,
      arrow: { top: anchorRect.bottom - 22, left: anchorRect.right + offset - 5 },
    }),
    'right': () => ({
      top: Math.round(anchorRect.top + anchorRect.height / 2 - popH / 2),
      left: anchorRect.right + offset,
      arrow: { top: anchorRect.top + anchorRect.height / 2 - 5, left: anchorRect.right + offset - 5 },
    }),
  }

  // Базовая позиция
  let { top, left, arrow } = placements[placement]()

  // Коррекция выхода за правый/левый/нижний/верхний край
  const overflowRight = left + popW + viewportPadding - window.innerWidth
  if (overflowRight > 0)
    left -= overflowRight
  if (left < viewportPadding)
    left = viewportPadding

  const overflowBottom = top + popH + viewportPadding - window.innerHeight
  if (overflowBottom > 0)
    top -= overflowBottom
  if (top < viewportPadding)
    top = viewportPadding

  // Коррекция позиции стрелочки после шифтов
  const arrowLeft = clamp((arrow.left ?? 0) - left, 10, popW - 10)
  const arrowTop = clamp((arrow.top ?? 0) - top, 10, popH - 10)

  return { top, left, arrow: { left: arrowLeft, top: arrowTop } }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}
