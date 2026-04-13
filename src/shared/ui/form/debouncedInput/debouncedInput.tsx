import type { InputProps } from '@tinkerbells/xenon-ui'

import { Input } from '@tinkerbells/xenon-ui'
import { useEffect, useMemo, useRef, useState } from 'react'

import { formatNumericValue } from '@/shared/lib/numbers/format'
import { useDebouncedInput } from '@/shared/lib/hooks/useDebounceInput'

type DebouncedInputChangeValue<T extends string | number> = T extends number ? T | undefined : T

interface DebouncedInputProps<T extends string | number = string>
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue'> {
  /** Контролируемое значение инпута. */
  value?: T
  /** Начальное значение для uncontrolled-сценария. */
  defaultValue?: T
  /** Тип HTML input, который определяет и стратегию преобразования значения. */
  type?: 'text' | 'number'
  /** Вызывается после debounce уже с нормализованным значением. */
  onChange: (value: DebouncedInputChangeValue<T>) => void
  /** Задержка перед commit значения наружу. */
  debounceMs?: number
}

function toNumericInputString(value: unknown): string {
  if (value === null || value === undefined)
    return ''

  return String(value).replace(/\s+/g, '').replace('.', ',')
}

function toNumericEditableString(value: string): string {
  return value.replace(/\s+/g, '')
}

function isIncompleteNumericInput(value: string): boolean {
  return value === '-'
    || value.endsWith(',')
    || value.endsWith('.')
}

function toFormattedNumericDisplay(value: string): string {
  const normalized = toNumericEditableString(value).trim()
  if (!normalized.length || isIncompleteNumericInput(normalized))
    return normalized

  const numeric = Number(normalized.replace(',', '.'))
  if (!Number.isFinite(numeric))
    return normalized

  const separatorIndex = normalized.search(/[,.]/)
  const fractionDigits = separatorIndex === -1
    ? 0
    : normalized.slice(separatorIndex + 1).length

  return formatNumericValue(numeric, {
    fractionDigits,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  })
}

/**
 * Дебаунсит ввод и публикует наружу уже нормализованное значение.
 * Для numeric режима пустая строка конвертируется в `undefined`, чтобы форма могла очищать поле.
 */
export function DebouncedInput<T extends string | number = string>({
  value,
  defaultValue,
  type = 'text',
  onChange,
  debounceMs = 300,
  ...rest
}: DebouncedInputProps<T>) {
  const initial = type === 'number'
    ? (toNumericInputString(value ?? defaultValue) as T)
    : (value ?? defaultValue ?? ('' as T))
  const [inputValue, setInputValue, debouncedValue] = useDebouncedInput(
    String(initial),
    debounceMs,
  )
  const isFirstCommitRef = useRef(true)
  const onChangeRef = useRef(onChange)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  /**
   * Коммитит debounced значение наружу и специально пропускает первый mount,
   * чтобы `defaultValue` не инициировал лишний onChange сразу после рендера.
   */
  useEffect(() => {
    if (isFirstCommitRef.current) {
      isFirstCommitRef.current = false
      return
    }

    if (type === 'number') {
      const raw = toNumericEditableString(String(debouncedValue)).trim()
      if (!raw.length) {
        onChangeRef.current(undefined as DebouncedInputChangeValue<T>)
        return
      }

      const finalValue = Number(raw.replace(',', '.')) as T
      if (!Number.isNaN(finalValue))
        onChangeRef.current(finalValue as DebouncedInputChangeValue<T>)
      return
    }

    onChangeRef.current(debouncedValue as DebouncedInputChangeValue<T>)
  }, [debouncedValue, type])

  const displayValue = useMemo(() => {
    if (type !== 'number' || isFocused)
      return inputValue

    return toFormattedNumericDisplay(inputValue)
  }, [inputValue, isFocused, type])

  return (
    <Input
      {...rest}
      type={type === 'number' ? 'text' : type}
      inputMode={type === 'number' ? 'decimal' : undefined}
      value={displayValue}
      onFocus={(event) => {
        if (type === 'number') {
          setIsFocused(true)
          setInputValue(prev => toNumericEditableString(prev))
        }
        rest.onFocus?.(event)
      }}
      onBlur={(event) => {
        if (type === 'number')
          setIsFocused(false)
        rest.onBlur?.(event)
      }}
      onChange={(event) => {
        const nextValue = type === 'number'
          ? toNumericEditableString(event.target.value)
          : event.target.value
        setInputValue(nextValue)
      }}
    />
  )
}
