import type { DragEvent } from 'react'

const NATIVE_DND_MIME_TYPE = 'text/plain'

/**
 * Пишет id перетаскиваемого элемента в `dataTransfer` и фиксирует move-режим.
 *
 * Обертка с `try/catch` нужна для безопасной работы в средах/браузерах,
 * где доступ к `dataTransfer` ограничен.
 */
export function setNativeDragId(event: DragEvent<HTMLElement>, id: string) {
  try {
    event.dataTransfer.setData(NATIVE_DND_MIME_TYPE, id)
    event.dataTransfer.effectAllowed = 'move'
  }
  catch {}
}

/**
 * Читает id источника из `dataTransfer`.
 * Если payload недоступен, возвращает `fallback` или пустую строку.
 */
export function getNativeDragId(event: DragEvent<HTMLElement>, fallback?: string | null) {
  if (fallback)
    return fallback

  try {
    return event.dataTransfer.getData(NATIVE_DND_MIME_TYPE)
  }
  catch {
    return ''
  }
}

/**
 * Устанавливает для текущего hover-состояния ожидаемый `dropEffect = move`.
 */
export function setNativeMoveDropEffect(event: DragEvent<HTMLElement>) {
  try {
    event.dataTransfer.dropEffect = 'move'
  }
  catch {}
}

/**
 * Возвращает новый порядок id после drop:
 * - `fromId` удаляется из старой позиции,
 * - вставляется на позицию `targetId` после удаления источника.
 *
 * Возвращает `null`, если reorder не требуется или входные id невалидны.
 */
export function reorderIdsByDropTarget(ids: string[], fromId: string, targetId: string): string[] | null {
  if (!fromId || fromId === targetId)
    return null

  const fromIdx = ids.indexOf(fromId)
  const toIdx = ids.indexOf(targetId)
  if (fromIdx === -1 || toIdx === -1)
    return null

  const next = ids.slice()
  next.splice(fromIdx, 1)
  next.splice(toIdx, 0, fromId)
  return next
}
