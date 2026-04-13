import type { RowSelectionState } from '@tanstack/react-table'

import { useEffect, useMemo, useState } from 'react'

import type { Scalar } from '@/shared/types/types'

/**
 * Двусторонняя синхронизация выбора:
 * - Принимает внешний массив выбранных Scalar (из per-chart конфига).
 * - Держит контролируемый state rowSelection (формата TanStack).
 * - Реагирует на внешние изменения без лишних ререндеров (поверхностное сравнение ключей).
 *
 * @param externalSelected массив выбранных значений (Scalar[])
 * @returns { rowSelection, setRowSelection }
 */
export function useRowSelectionSync(externalSelected: Scalar[]) {
  const externalSelectionMap: RowSelectionState = useMemo(() => {
    const map: RowSelectionState = {}
    for (const v of externalSelected) map[String(v)] = true
    return map
  }, [externalSelected])

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    setRowSelection((prev) => {
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(externalSelectionMap)
      if (prevKeys.length === nextKeys.length && prevKeys.every(k => nextKeys.includes(k)))
        return prev
      return externalSelectionMap
    })
  }, [externalSelectionMap])

  return { rowSelection, setRowSelection }
}
