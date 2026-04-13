import type { SliderSingleProps } from 'antd'

import { Slider } from 'antd'
import { useEffect, useRef } from 'react'

import { useDebouncedInput } from '@/shared/lib/hooks/useDebounceInput'

import cls from './debouncedSlider.module.scss'
import { RefreshButton } from '../../buttons/refreshButton/refreshButton'

interface DebouncedSliderProps
  extends Omit<SliderSingleProps, 'value' | 'defaultValue' | 'onChange'> {
  /** Контролируемое значение слайдера. */
  value?: number
  /** Базовое значение для reset и uncontrolled-инициализации. */
  defaultValue?: number
  /** Шаг изменения значения. */
  step?: number
  /** Колбэк, который получает debounced numeric value. */
  onChange: (value: number) => void
  /** Задержка перед commit изменения. */
  debounceMs?: number
  /** Показывать ли кнопку сброса к defaultValue. */
  withClearBtn?: boolean
}

/** Debounced-обёртка над `Slider`, чтобы частые drag-события не публиковались в model слой мгновенно. */
export function DebouncedSlider({
  value,
  defaultValue,
  onChange,
  step,
  debounceMs = 300,
  withClearBtn = true,
  ...rest
}: DebouncedSliderProps) {
  const initial = value ?? defaultValue ?? 0
  const [sliderValue, setSliderValue, debouncedValue] = useDebouncedInput(
    initial,
    debounceMs,
  )
  const isFirstCommitRef = useRef(true)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  /** Пропускает первый mount и публикует только реальные пользовательские изменения после debounce. */
  useEffect(() => {
    if (isFirstCommitRef.current) {
      isFirstCommitRef.current = false
      return
    }

    if (!Number.isNaN(debouncedValue)) {
      onChangeRef.current(debouncedValue)
    }
  }, [debouncedValue])

  /** Возвращает слайдер к `defaultValue` и сразу публикует reset наружу. */
  const handleReset = () => {
    if (defaultValue !== undefined) {
      setSliderValue(defaultValue)
      onChangeRef.current(defaultValue)
    }
  }

  return (
    <div className={cls.debouncedSlider}>
      <Slider
        classNames={{ root: cls.slider }}
        {...rest}
        value={sliderValue}
        step={step}
        onChange={(val: number) => {
          if (typeof val === 'number') {
            setSliderValue(val)
          }
        }}
      />
      {defaultValue !== undefined && withClearBtn && (
        <RefreshButton onClick={handleReset} className={cls.btn} title="Сбросить" />
      )}
    </div>
  )
}
