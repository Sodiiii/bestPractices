export type RenderControlInputsAvailableType
  = | 'text' | 'textarea' | 'checkbox' | 'switch' | 'color' | 'select' | 'number'
    | 'slider' | 'numberSelect' | 'textSelect' | 'multiSelect' | 'radioGroup'

export type UiControlLabelPlacement = 'inline' | 'above' | 'hidden'

export type ValueModifier = (v: unknown) => unknown

export interface UiControlTableMeta {
  /** Идентификатор таблицы (для группировки соседних полей в один table-блок). */
  id: string
  /** Заголовок строки. */
  row: string
  /** Заголовок столбца. */
  column: string
}

/** Унифицированная схема контрола */
export interface UiControlSchema {
  /** Ключ, который вернется в onChange */
  key: string
  /** Человеко-понятное название */
  label: string
  /** Заголовок над элементом — для "подгрупп" */
  labelAbove?: string
  /** Расположение label относительно контрола. */
  labelPlacement?: UiControlLabelPlacement
  /** Группа для секционного рендера */
  group?: string
  /** Тип UI-компонента */
  type: RenderControlInputsAvailableType
  /** Значение по умолчанию — используется, если нет modelValue */
  default?: unknown
  /** Диапазоны (для numeric типов) */
  min?: number
  max?: number
  step?: number
  /** Для select — доступные опции */
  options?: { label: string, value: unknown }[]
  /** Placeholder для text/number/select-like контролов. */
  placeholder?: string
  /** Grid-span элемента внутри layout-обёртки renderer. */
  span?: number
  /** Разрешить ли очистку значения в select-like контролах. */
  allowClear?: boolean
  /** Значение, которое должно устанавливаться при clear. */
  clearValue?: unknown
  /** Разрешить ли произвольный ввод для input-select контролов. */
  allowCustom?: boolean
  /** Фильтровать ли options по введённой строке. */
  filterByInput?: boolean
  /** Нужно ли показывать value рядом с label в dropdown. */
  renderValueInSelect?: boolean
  /** Подсказка */
  tooltip?: string
  /** Условие видимости поля в UI. */
  visibleWhen?: (values: Record<string, unknown>) => boolean
  /** Метаданные табличной раскладки: если заданы, поле рендерится в table-ячейке. */
  table?: UiControlTableMeta

  /**
   * объект модификаций значения контрола
   */
  modifier?: {
    /** значение из UI -> в модель/стор */
    toModel?: ValueModifier
    /** значение из модели/стора -> в UI */
    toControl?: ValueModifier
  }
}
