import type { DragEvent } from 'react'

import { useCallback, useRef, useState } from 'react'

import { getNativeDragId, reorderIdsByDropTarget, setNativeDragId, setNativeMoveDropEffect } from '../dnd/nativeDnD'

interface UseNativeListDnDOptions {
  enabled?: boolean
  itemIds: string[]
  onReorder: (nextIds: string[]) => void
}

/**
 * Пример использования:
 * ```tsx
 * const ids = items.map(item => item.id)
 * const { draggingId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
 *   useNativeListDnD({ itemIds: ids, onReorder: nextIds => setItems(reorder(items, nextIds)) })
 *
 * return items.map(item => (
 *   <div
 *     key={item.id}
 *     draggable
 *     onDragStart={e => handleDragStart(e, item.id)}
 *     onDragOver={e => handleDragOver(e, item.id)}
 *     onDrop={e => handleDrop(e, item.id)}
 *     onDragEnd={handleDragEnd}
 *     style={{ opacity: draggingId === item.id ? 0.4 : 1,
 *              outline: dragOverId === item.id ? '2px solid blue' : undefined }}
 *   >
 *     {item.label}
 *   </div>
 * ))
 * ```
 */

/**
 * Native DnD-хук для линейного списка элементов.
 *
 * Хук инкапсулирует:
 * - захват id источника drag,
 * - отслеживание текущего hover-элемента,
 * - вычисление нового порядка id через `reorderIdsByDropTarget`.
 */
export function useNativeListDnD({ enabled = true, itemIds, onReorder }: UseNativeListDnDOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const draggingIdRef = useRef<string | null>(null)
  const dragOverIdRef = useRef<string | null>(null)

  /**
   * Сбрасывает состояние drag-сессии.
   */
  const resetDragState = useCallback(() => {
    draggingIdRef.current = null
    dragOverIdRef.current = null
    setDraggingId(null)
    setDragOverId(null)
  }, [])

  /**
   * Старт drag для конкретного id.
   */
  const handleDragStart = useCallback((event: DragEvent<HTMLElement>, id: string) => {
    if (!enabled)
      return

    draggingIdRef.current = id
    setDraggingId(id)
    setNativeDragId(event, id)
  }, [enabled])

  /**
   * Hover над потенциальной drop-целью.
   */
  const handleDragOver = useCallback((event: DragEvent<HTMLElement>, id: string) => {
    if (!enabled)
      return

    event.preventDefault()
    if (dragOverIdRef.current !== id) {
      dragOverIdRef.current = id
      setDragOverId(id)
    }
    setNativeMoveDropEffect(event)
  }, [enabled])

  /**
   * Drop на целевой элемент и применение reorder.
   */
  const handleDrop = useCallback((event: DragEvent<HTMLElement>, targetId: string) => {
    if (!enabled)
      return

    event.preventDefault()
    const fromId = getNativeDragId(event, draggingIdRef.current)
    const nextIds = reorderIdsByDropTarget(itemIds, fromId, targetId)
    if (!nextIds)
      return

    onReorder(nextIds)
    resetDragState()
  }, [enabled, itemIds, onReorder, resetDragState])

  return {
    draggingId,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd: resetDragState,
  }
}
