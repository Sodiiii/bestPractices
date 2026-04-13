import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Хук для отслеживания высоты DOM-элемента через ResizeObserver.
 * Принимает необязательный колбэк, который вызывается один раз при первом успешном замере высоты (>0).
 *
 * @param onFirstMeasure - колбэк, вызывающийся при первом замере высоты > 0
 */
export function useElementSize(onFirstMeasure?: () => void) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number>(0)
  const [width, setWidth] = useState<number>(0)
  const measuredRef = useRef(false) // чтобы вызвать колбек только 1 раз
  const onFirstMeasureRef = useRef(onFirstMeasure)

  const ref = useCallback((node: HTMLDivElement | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    onFirstMeasureRef.current = onFirstMeasure
  }, [onFirstMeasure])

  useEffect(() => {
    if (!element) {
      setHeight(0)
      setWidth(0)
      return
    }

    measuredRef.current = false

    const observer = new ResizeObserver(([entry]) => {
      const newHeight = entry.contentRect.height
      const newWidth = entry.contentRect.width
      setHeight(prev => (prev === newHeight ? prev : newHeight))
      setWidth(prev => (prev === newWidth ? prev : newWidth))

      if (!measuredRef.current && newHeight > 0 && newWidth > 0) {
        measuredRef.current = true
        onFirstMeasureRef.current?.()
      }
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [element])

  return { ref, height, width }
}
