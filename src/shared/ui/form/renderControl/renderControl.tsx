import type { ReactNode } from 'react'

import { Checkbox, Radio, Select, Switch } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import type { UiControlLabelPlacement, UiControlSchema } from './config/control.types'

import cls from './renderControl.module.scss'
import { toControl, toModel } from './config/valueTransform'
import { DebouncedInput } from '../debouncedInput/debouncedInput'
import { HelpTooltip } from '../../tooltips/helpTooltip/helpTooltip'
import { DebouncedSlider } from '../debouncedSlider/debouncedSlider'
import { DebouncedTextarea } from '../debouncedTextarea/debouncedTextarea'
import { SelectColorPicker } from '../../selectColorPicker/selectColorPicker'
import { DebouncedInputSelect } from '../debouncedInputSelect/debouncedInputSelect'
import { DebouncedMultiSelect } from '../debouncedMultiSelect/debouncedMultiSelect'

interface Props {
  /** Унифицированный дескриптор контрола */
  item: UiControlSchema
  /**
   * Текущее значение из модели (raw). Если не передано — упадём на item.default
   * ВАЖНО: к UI попадёт результат toControl(item, value).
   */
  modelValue?: unknown
  /** Колбек, получит (key, transformedValue) — уже после toModel */
  onChange: (key: string, value: unknown) => void
  /** Скрыть стандартный label (используется для табличных ячеек). */
  hideLabel?: boolean
}

/** Нормализует произвольное значение к строке для text-based контролов. */
function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '')
}

/** Возвращает строку или `undefined`, если значение отсутствует. */
function toOptionalStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined)
    return undefined
  return toStringValue(value)
}

/** Нормализует значение к числу с fallback, если raw модель содержит строку или `undefined`. */
function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value))
    return value

  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

/** Возвращает число или `undefined`, сохраняя возможность пустого numeric input. */
function toOptionalNumberValue(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '')
    return undefined

  if (typeof value === 'number' && !Number.isNaN(value))
    return value

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/** Приводит multi-value model к строковому массиву для UI multiselect компонентов. */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value))
    return []
  return value.map(item => String(item))
}

/** Нормализует options схемы к numeric списку, отбрасывая невалидные значения. */
function toNumberOptions(options: UiControlSchema['options']): { label: string, value: number }[] {
  return (options ?? []).flatMap((option) => {
    const num = toNumberValue(option.value, Number.NaN)
    return Number.isNaN(num) ? [] : [{ label: option.label, value: num }]
  })
}

/** Нормализует options схемы к текстовому списку. */
function toTextOptions(options: UiControlSchema['options']): { label: string, value: string }[] {
  return (options ?? []).map(option => ({ label: option.label, value: String(option.value) }))
}

/** Преобразует raw select value в primitive, который ожидает xenon `Select`. */
function toSelectValue(value: unknown): string | number | undefined {
  if (typeof value === 'string' || typeof value === 'number')
    return value
  if (value === null || value === undefined)
    return undefined
  return String(value)
}

/** Унифицирует `UiControlSchema.options` в select-friendly primitive options. */
function toSelectOptions(options: UiControlSchema['options']): { label: string, value: string | number }[] {
  return (options ?? []).map((option) => {
    if (typeof option.value === 'string' || typeof option.value === 'number') {
      return { label: option.label, value: option.value }
    }
    return { label: option.label, value: String(option.value) }
  })
}

function resolveLabelPlacement(
  item: UiControlSchema,
  hideLabel: boolean,
  fallback: UiControlLabelPlacement,
): UiControlLabelPlacement {
  if (hideLabel)
    return 'hidden'

  return item.labelPlacement ?? fallback
}

function renderWrappedControl(params: {
  key: string
  className: string
  control: ReactNode
  title: ReactNode
  labelPlacement: UiControlLabelPlacement
  inlineOrder?: 'titleFirst' | 'controlFirst'
}) {
  const {
    key,
    className,
    control,
    title,
    labelPlacement,
    inlineOrder = 'titleFirst',
  } = params

  if (labelPlacement === 'hidden' || !title) {
    return (
      <div className={className} key={key}>
        {control}
      </div>
    )
  }

  if (labelPlacement === 'above') {
    return (
      <label className={cn(className, cls.labelAboveLayout)} key={key}>
        {title}
        {control}
      </label>
    )
  }

  return (
    <label className={className} key={key}>
      {inlineOrder === 'titleFirst' && title}
      {control}
      {inlineOrder === 'controlFirst' && title}
    </label>
  )
}

/**
 * Рендерит UI control по универсальной схеме и централизует переход
 * `model -> control -> model` через `toControl/toModel`.
 */
export function renderControl({ item, modelValue, onChange, hideLabel = false }: Props) {
  const uiValue = toControl(item, modelValue ?? item.default)
  const uiDefaultValue = toControl(item, item.default)

  const emit = (v: unknown) => onChange(item.key, toModel(item, v))
  const title = hideLabel
    ? null
    : (
        <span className={cls.title}>
          {item.label}
          {item.tooltip && <HelpTooltip text={item.tooltip} />}
        </span>
      )

  switch (item.type) {
    case 'checkbox':
      return (
        <Checkbox
          key={item.key}
          checked={!!uiValue}
          onChange={e => emit(e.target.checked)}
          className={cn('renderControl-checkbox')}
        >
          {title}
        </Checkbox>
      )

    case 'switch':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.switchLabel, 'renderControl-switch'),
        control: <Switch checked={!!uiValue} onChange={emit} />,
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'inline'),
        inlineOrder: 'titleFirst',
      })

    case 'number':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.inputLabel, 'renderControl-input'),
        control: (
          <DebouncedInput<number>
            min={item.min ?? 0}
            max={item.max ?? 100}
            step={item.step}
            defaultValue={toOptionalNumberValue(uiValue)}
            type="number"
            placeholder={item.placeholder}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'inline'),
        inlineOrder: 'controlFirst',
      })

    case 'text':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.inputLabel, 'renderControl-input'),
        control: (
          <DebouncedInput<string>
            defaultValue={toStringValue(uiValue)}
            type="text"
            placeholder={item.placeholder}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'inline'),
        inlineOrder: 'controlFirst',
      })

    case 'textarea':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.selectLabel, 'renderControl-textarea'),
        control: (
          <DebouncedTextarea
            rows={8}
            value={String(uiValue ?? '')}
            placeholder={item.placeholder}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    case 'slider':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.sliderLabel, 'renderControl-slider'),
        control: (
          <DebouncedSlider
            step={item.step}
            min={item.min ?? 0}
            max={item.max ?? 99}
            value={typeof uiValue === 'number' ? uiValue : Number(uiValue ?? 0)}
            defaultValue={typeof uiDefaultValue === 'number' ? uiDefaultValue : Number(uiDefaultValue ?? 0)}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    case 'select':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.selectLabel, 'renderControl-select'),
        control: (
          <Select
            value={toSelectValue(uiValue)}
            placeholder={item.placeholder}
            options={toSelectOptions(item.options)}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    case 'multiSelect':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.multiSelectLabel, 'renderControl-multiSelect'),
        control: (
          <DebouncedMultiSelect
            minSelectedCount={item.min}
            maxSelectedCount={item.max}
            defaultValue={toStringArray(uiValue)}
            options={toTextOptions(item.options)}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    case 'numberSelect':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.selectNumberLabel, 'renderControl-selectNumber'),
        control: (
          <DebouncedInputSelect<number>
            defaultValue={toOptionalNumberValue(uiValue)}
            type="number"
            placeholder={item.placeholder}
            allowCustom={item.allowCustom}
            filterByInput={item.filterByInput}
            renderValueInSelect={item.renderValueInSelect}
            options={toNumberOptions(item.options)}
            onChange={emit}
            onClear={item.allowClear ? () => emit(item.clearValue) : undefined}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'inline'),
        inlineOrder: 'controlFirst',
      })

    case 'textSelect':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.selectTextLabel, 'renderControl-selectText'),
        control: (
          <DebouncedInputSelect<string>
            defaultValue={toStringValue(uiValue)}
            type="text"
            placeholder={item.placeholder}
            allowCustom={item.allowCustom}
            filterByInput={item.filterByInput}
            renderValueInSelect={item.renderValueInSelect}
            options={toTextOptions(item.options)}
            onChange={emit}
            onClear={item.allowClear ? () => emit(item.clearValue) : undefined}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'inline'),
        inlineOrder: 'controlFirst',
      })

    case 'color':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.colorLabel, 'renderControl-color'),
        control: (
          <SelectColorPicker
            defaultValue={toOptionalStringValue(uiValue)}
            onChange={emit}
          />
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    case 'radioGroup':
      return renderWrappedControl({
        key: item.key,
        className: cn(cls.radioGroupLabel, 'renderControl-radioGroup'),
        control: (
          <Radio.Group
            className={cls.radioGroup}
            value={toSelectValue(uiValue)}
            onChange={event => emit(event.target.value)}
          >
            {toSelectOptions(item.options).map(option => (
              <Radio key={String(option.value)} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        ),
        title,
        labelPlacement: resolveLabelPlacement(item, hideLabel, 'above'),
      })

    default:
      return null
  }
}
