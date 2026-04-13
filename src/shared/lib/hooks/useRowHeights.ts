import { useEffect, useRef, useState } from 'react'

/**
 * Хук для измерения высот всех строк DOM-контейнера (одна строка = один ref).
 * Возвращает массив ref'ов и высоты строк.
 *
 * @param rowCount - количество строк
 * @param onFirstMeasure - вызывается, когда все строки измерены (все > 0)
 */
export function useRowHeights(rowCount: number, onFirstMeasure?: () => void) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [heights, setHeights] = useState<number[]>(Array.from({ length: rowCount }).fill(0) as number[])
  const measuredRef = useRef(false)

  useEffect(() => {
    if (refs.current.length !== rowCount)
      refs.current = Array.from({ length: rowCount }).fill(null) as null[]

    const observer = new ResizeObserver(() => {
      const newHeights = refs.current.map(el => el?.getBoundingClientRect().height || 0)
      setHeights(newHeights)

      if (
        !measuredRef.current
        && newHeights.every(h => h > 0)
      ) {
        measuredRef.current = true
        onFirstMeasure?.()
      }
    })

    refs.current.forEach(el => el && observer.observe(el))

    return () => observer.disconnect()
  }, [rowCount, onFirstMeasure])

  return {
    refs,
    heights,
  }
}
