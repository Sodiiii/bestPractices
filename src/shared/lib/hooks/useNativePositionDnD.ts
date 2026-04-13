import type { DragEvent } from 'react'

import { useCallback, useRef, useState } from 'react'

import { getNativeDragId, setNativeDragId, setNativeMoveDropEffect } from '../dnd/nativeDnD'

interface DragItem<TPosition> {
  id: string
  position: TPosition
}

interface UseNativePositionDnDOptions<TPosition> {
  enabled: boolean
  findItemById: (itemId: string) => DragItem<TPosition> | null
  isSamePosition: (sourcePosition: TPosition, targetPosition: TPosition) => boolean
  onDropToPosition: (sourceItemId: string, targetPosition: TPosition) => void
}

/**
 * Универсальный native DnD для элементов, у которых есть позиция.
 *
 * Хук не знает о домене (chart/binding/row): доменная логика передается через callbacks.
 * Это позволяет переиспользовать один DnD-движок в разных UI-сценариях.
 */
export function useNativePositionDnD<TPosition>({
  enabled,
  findItemById,
  isSamePosition,
  onDropToPosition,
}: UseNativePositionDnDOptions<TPosition>) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<TPosition | null>(null)
  const draggedItemRef = useRef<string | null>(null)

  /**
   * Сбрасывает временное DnD-состояние после завершения drag/drop.
   */
  const clearDragState = useCallback(() => {
    draggedItemRef.current = null
    setDraggedItemId(null)
    setDragOverPosition(null)
  }, [])

  /**
   * Читает id источника drag из `dataTransfer`, с fallback в ref/state.
   */
  const getSourceItemId = useCallback((event: DragEvent<HTMLElement>) => {
    return getNativeDragId(event, draggedItemRef.current ?? draggedItemId)
  }, [draggedItemId])

  /**
   * Старт drag-сессии: сохраняет id источника в native payload и локальное состояние.
   */
  const handleDragStart = useCallback((itemId: string) => (event: DragEvent<HTMLElement>) => {
    if (!enabled)
      return

    setNativeDragId(event, itemId)
    draggedItemRef.current = itemId
    setDraggedItemId(itemId)
    setDragOverPosition(null)
  }, [enabled])

  /**
   * Обрабатывает hover над позицией: разрешает drop и подсвечивает текущую цель.
   */
  const handleDragOver = useCallback((position: TPosition) => (event: DragEvent<HTMLElement>) => {
    if (!enabled)
      return

    const sourceId = getSourceItemId(event)
    if (!sourceId)
      return

    const source = findItemById(sourceId)
    if (!source)
      return
    if (isSamePosition(source.position, position))
      return

    event.preventDefault()
    setNativeMoveDropEffect(event)

    setDragOverPosition((prev) => {
      if (prev && isSamePosition(prev, position))
        return prev
      return position
    })
  }, [enabled, findItemById, getSourceItemId, isSamePosition])

  /**
   * Завершает drop-сессию и делегирует фактическое перемещение доменному callback.
   */
  const handleDrop = useCallback((position: TPosition) => (event: DragEvent<HTMLElement>) => {
    if (!enabled)
      return

    event.preventDefault()
    const sourceId = getSourceItemId(event)
    if (!sourceId)
      return

    const source = findItemById(sourceId)
    if (!source)
      return

    if (isSamePosition(source.position, position)) {
      clearDragState()
      return
    }

    onDropToPosition(sourceId, position)
    clearDragState()
  }, [clearDragState, enabled, findItemById, getSourceItemId, isSamePosition, onDropToPosition])

  return {
    draggedItemId,
    dragOverPosition,
    clearDragState,
    handleDragStart,
    handleDragEnd: clearDragState,
    handleDragOver,
    handleDrop,
  }
}
