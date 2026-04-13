import type { MenuProps } from 'antd'
import type { InputProps } from '@tinkerbells/xenon-ui'

import { Dropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { Button, Input } from '@tinkerbells/xenon-ui'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/shared/lib/classNames'
import { useDebouncedInput } from '@/shared/lib/hooks/useDebounceInput'

import cls from './debouncedInputSelect.module.scss'
import { RefreshButton } from '../../buttons/refreshButton/refreshButton'

interface Option<T extends string | number = string> {
  /** Реальное значение option, которое уходит в form/model слой. */
  value: T
  /** Подпись, отображаемая в dropdown. */
  label: string
}

type DebouncedInputSelectChangeValue<T extends string | number> = T extends number ? T | undefined : T

interface DebouncedInputSelectProps<T extends string | number = string>
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  className?: string
  /** Источник значений для выпадающего списка */
  options: Option<T>[]
  /** Контролируемое значение */
  value?: T
  /** Неконтролируемое начальное значение */
  defaultValue?: T
  /** Тип значения */
  type?: 'text' | 'number'
  /** Разрешить ли произвольный ввод (true по умолчанию) */
  allowCustom?: boolean
  /** Дебаунс для ручного ввода */
  debounceMs?: number
  /** Колбэк изменения значения */
  onChange: (value: DebouncedInputSelectChangeValue<T>) => void
  /** Очистка значения (опционально) */
  onClear?: () => void
  /** Фильтрация списка по введённой строке (по умолчанию true) */
  filterByInput?: boolean
  /** Отображать ли value рядом с label (по умолчанию false) */
  renderValueInSelect?: boolean
}

/**
 * Комбинирует свободный debounced input и dropdown со справочными значениями.
 *
 * Алгоритм:
 * - хранит локальную строку ввода;
 * - в `allowCustom` режиме коммитит её наружу с debounce;
 * - при выборе из списка публикует значение сразу, без debounce;
 * - для `number` режима пустая строка нормализуется в `undefined`.
 */
export function DebouncedInputSelect<T extends string | number = string>({
  className,
  options,
  value,
  defaultValue,
  type = 'text',
  allowCustom = true,
  debounceMs = 300,
  filterByInput = false,
  renderValueInSelect = false,
  onChange,
  onClear,
  ...rest
}: DebouncedInputSelectProps<T>) {
  const isControlled = value !== undefined
  const initial = value ?? defaultValue ?? ('' as T)

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue, debouncedValue] = useDebouncedInput(
    String(initial),
    debounceMs,
  )
  const isFirstCommitRef = useRef(true)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  /** Подхватываем внешние изменения `value` в контролируемом режиме и синхронизируем локальный input. */
  useEffect(() => {
    if (isControlled) {
      setInputValue(String(value ?? ''))
    }
  }, [isControlled, value])

  /**
   * Обрабатывает ручной ввод с debounce.
   * Для numeric режима не публикует `NaN`, а пустое значение приводит к `undefined`.
   */
  useEffect(() => {
    if (isFirstCommitRef.current) {
      isFirstCommitRef.current = false
      return
    }

    if (!allowCustom)
      return
    const raw = debouncedValue

    if (type === 'number' && !String(raw).trim().length) {
      onChangeRef.current(undefined as DebouncedInputSelectChangeValue<T>)
      return
    }

    const finalValue
      = type === 'number' ? (Number(raw) as T) : (raw as unknown as T)

    if (type === 'number') {
      if (!Number.isNaN(finalValue))
        onChangeRef.current(finalValue as DebouncedInputSelectChangeValue<T>)
    }
    else {
      onChangeRef.current(finalValue as DebouncedInputSelectChangeValue<T>)
    }
  }, [allowCustom, debouncedValue, type])

  /** Выбор из dropdown коммитится сразу, потому что значение уже дискретное и валидное. */
  const selectValue = (v: T) => {
    setInputValue(String(v))
    onChangeRef.current(v as DebouncedInputSelectChangeValue<T>)
    setOpen(false)
  }

  const items: MenuProps['items'] = useMemo(() => {
    const ip = inputValue.trim().toLowerCase()
    const base
      = filterByInput && ip.length
        ? options.filter(
            o =>
              o.label.toLowerCase().includes(ip)
              || String(o.value).toLowerCase().includes(ip),
          )
        : options

    return base.map(o => ({
      key: String(o.value),
      label: (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{o.label}</span>
          {renderValueInSelect && (
            <span style={{ opacity: 0.6 }}>
              {String(o.value)}
            </span>
          )}
        </div>
      ),
      onClick: () => selectValue(o.value),
    }))
  }, [options, inputValue, filterByInput])

  /** Сбрасывает значение в пустое состояние или делегирует кастомному `onClear`. */
  const clear = () => {
    setInputValue('')
    if (onClear) {
      onClear()
    }
    else {
      if (type === 'number') {
        onChangeRef.current(undefined as DebouncedInputSelectChangeValue<T>)
      }
      else {
        onChangeRef.current('' as DebouncedInputSelectChangeValue<T>)
      }
    }
  }

  return (
    <div className={cn(cls.selectInput, className)} data-keep-open>
      <div
        style={{
          display: 'flex',
          //   gridTemplateColumns: onClear ? '1fr auto auto' : '1fr auto',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <Input
          {...rest}
          type={type}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />

        {onClear && (
          <RefreshButton
            aria-label="Очистить"
            onClick={clear}
            title="Сбросить"
          />
        )}

        <Dropdown
          menu={{ items }}
          trigger={['click']}
          open={open}
          onOpenChange={setOpen}
        >
          <Button className={cls.btn} onClick={e => e.preventDefault()}><DownOutlined /></Button>
        </Dropdown>
      </div>
    </div>
  )
}
