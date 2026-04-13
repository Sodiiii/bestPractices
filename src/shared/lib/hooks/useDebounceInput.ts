import { useEffect, useState } from 'react'

// Customized based on https://github.com/vercel/swr/issues/110#issuecomment-552637429
export function useDebouncedInput<T>(initialValue: T, delay = 300) {
  const [realValue, setRealValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue) // тоже инициализируем initialValue

  // При изменении realValue ждём delay и обновляем debouncedValue
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(realValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [realValue, delay])

  // При смене initialValue сразу сбрасываем оба стейта
  useEffect(() => {
    setRealValue(initialValue)
    setDebouncedValue(initialValue)
  }, [initialValue])

  return [realValue, setRealValue, debouncedValue] as [
    T,
    React.Dispatch<React.SetStateAction<T>>,
    T,
  ]
}
