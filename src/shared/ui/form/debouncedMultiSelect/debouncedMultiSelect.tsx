import { Select } from '@tinkerbells/xenon-ui'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Option { label: string, value: string, disabled?: boolean }

interface Props {
  options: Option[]
  defaultValue?: string[]
  onChange: (v: string[]) => void
  /** Минимально допустимое количество выбранных значений (если меньше — onChange не шлём) */
  minSelectedCount?: number
  /** Максимально допустимое количество выбранных значений (лишние не добавляются) */
  maxSelectedCount?: number
}

export function DebouncedMultiSelect(props: Props) {
  const {
    options,
    defaultValue = [],
    onChange,
    minSelectedCount,
    maxSelectedCount,
  } = props

  // быстрый доступ к "разрешённым" значениям
  const allowed = useMemo(() => new Set(options.map(o => o.value)), [options])

  // начальное значение — только валидные элементы из defaultValue + учёт maxSelectedCount
  const initial = useRef<string[]>(
    (defaultValue.filter(v => allowed.has(v))).slice(
      0,
      typeof maxSelectedCount === 'number' ? maxSelectedCount : undefined,
    ),
  )

  const [value, setValue] = useState<string[]>(initial.current)

  // ресинхронизация, если список options поменялся (пропали какие-то значения)
  useEffect(() => {
    setValue((prev) => {
      const sanitized = prev.filter(v => allowed.has(v))
      if (typeof maxSelectedCount === 'number' && sanitized.length > maxSelectedCount) {
        return sanitized.slice(0, maxSelectedCount)
      }
      return sanitized
    })
    // намеренно НЕ вызываем onChange здесь, чтобы не плодить нежелательные апдейты "изнутри"
    // родитель при необходимости может сам отреагировать на смену options
  }, [allowed, maxSelectedCount])

  // при достижении maxSelectedCount — блокируем выбор новых пунктов (если Select поддерживает disabled у опций)
  const reachedMax = typeof maxSelectedCount === 'number' && value.length >= maxSelectedCount
  const computedOptions = useMemo<Option[]>(
    () =>
      options.map(o => ({
        ...o,
        disabled: o.disabled ?? (reachedMax && !value.includes(o.value)),
      })),
    [options, reachedMax, value],
  )

  return (
    <Select
      mode="multiple"
      options={computedOptions}
      value={value} // делаем контролируемым для точного соблюдения min/max
      onChange={(vals: string | string[]) => {
        // 1) приводим к массиву строк
        let arr = Array.isArray(vals) ? vals : (vals ? [vals] : [])

        // 2) удаляем неразрешённые значения
        arr = arr.filter(v => allowed.has(v))

        // 3) применяем ограничение maxSelectedCount
        if (typeof maxSelectedCount === 'number' && arr.length > maxSelectedCount) {
          arr = arr.slice(0, maxSelectedCount)
        }

        // 4) обновляем локальное состояние всегда (UI должен отображать текущий выбор)
        setValue(arr)

        // 5) вызываем onChange только если набран минимум (или он не задан)
        if (typeof minSelectedCount !== 'number' || arr.length >= minSelectedCount) {
          onChange(arr)
        }
        // 6) вызовем onChange с пустым массивом если минимум не набран
        if (arr.length < minSelectedCount) {
          onChange([])
        }
        // если min не достигнут — молчим, пока пользователь не наберёт достаточно значений
      }}
    />
  )
}
