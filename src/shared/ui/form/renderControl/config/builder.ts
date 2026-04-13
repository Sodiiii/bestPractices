import type { UiControlSchema, ValueModifier } from './control.types'

type Draft = Partial<Omit<UiControlSchema, 'key' | 'type'>> & { key?: string }

/**
 * ООП-билдер одного поля настройки.
 *
 * Сначала задаём ключ (path), затем цепочкой вызываем удобные сеттеры:
 *
 * Замечания по использованию:
 * - Один экземпляр билдера описывает одно поле (один ключ).
 * - только при `checkbox()/number()/...` формируется финальный объект `UiControlSchema`.
 */
class FieldBuilder {
  /** Черновик конфигурации поля */
  private draft: Draft = {}
  /** Полный путь ключа, например: "xAxis.labels.y" */
  private path: string

  constructor(path: string) {
    this.path = path
  }

  /**
   * Группа, под которой будет отображаться поле в UI (например: 'common' | 'xAxis' | 'yAxis').
   */
  group(v: string) { this.draft.group = v; return this }

  /** Человекочитаемое название настройки. */
  label(v: string) { this.draft.label = v; return this }

  /** Расположение label относительно контрола. */
  labelPlacement(v: UiControlSchema['labelPlacement']) { this.draft.labelPlacement = v; return this }

  /**
   * Дополнительный заголовок над полем (подгруппа, раздел), полезно для визуального блока.
   * Пример: 'Легенда', 'Метки', 'Управление прокруткой'.
   */
  labelAbove(v: string) { this.draft.labelAbove = v; return this }

  /** Подсказка по полю (tooltip). */
  tooltip(v: string) { this.draft.tooltip = v; return this }

  /** Значение по умолчанию. */
  default(v: unknown) { this.draft.default = v; return this }

  /** Placeholder контрола. */
  placeholder(v: string) { this.draft.placeholder = v; return this }

  /** Минимально допустимое значение (для number/slider). */
  min(v: number) { this.draft.min = v; return this }

  /** Максимально допустимое значение (для number/slider). */
  max(v: number) { this.draft.max = v; return this }

  /** Шаг инкремента (для number/slider). */
  step(v: number) { this.draft.step = v; return this }

  /**
   * Опции для select/textSelect/numberSelect.
   * @param v Список элементов выпадающего списка.
   */
  options(v: Array<{ label: string, value: unknown }>) { this.draft.options = v; return this }

  /** Grid-span элемента внутри layout renderer. */
  span(v: number) { this.draft.span = v; return this }

  /** Разрешить очистку значения. */
  allowClear(v = true) { this.draft.allowClear = v; return this }

  /** Значение, которое должно устанавливаться при clear. */
  clearValue(v: unknown) { this.draft.clearValue = v; return this }

  /** Разрешить произвольный ввод у input-select контролов. */
  allowCustom(v = true) { this.draft.allowCustom = v; return this }

  /** Фильтрация options по введённой строке. */
  filterByInput(v = true) { this.draft.filterByInput = v; return this }

  /** Показывать value рядом с label в dropdown. */
  renderValueInSelect(v = true) { this.draft.renderValueInSelect = v; return this }

  /**
   * Модификатор значения:
   * - если передан объект вида `{ toModel, toControl }`, обеспечивается двусторонняя трансформация
   *   между значением в UI (контроле) и значением в модели/сторе;
   * - если передана функция — трактуется как `toModel`.
   *
   * @example
   * ```ts
   * modifier({
   *   toModel: (n: number) => `${n}%`,
   *   toControl: (s: string) => parseFloat(s)
   * })
   * ```
   */
  modifier(m: UiControlSchema['modifier'] | ValueModifier) {
    this.draft.modifier = typeof m === 'function' ? { toModel: m } : m
    return this
  }

  /** Условие видимости поля в UI. */
  visibleWhen(v: UiControlSchema['visibleWhen']) { this.draft.visibleWhen = v; return this }

  /** Метаданные табличной раскладки поля. */
  table(id: string, row: string, column: string) {
    this.draft.table = { id, row, column }
    return this
  }

  /**
   * Удобный шорткат для задания диапазона и шага.
   * Эквивалентно последовательным вызовам `.min(min).max(max).step(step)`.
   *
   * @param min Минимум
   * @param max Максимум
   * @param step Шаг
   */
  range(min: number, max: number, step?: number) {
    this.draft.min = min; this.draft.max = max
    if (step !== undefined)
      this.draft.step = step
    return this
  }

  private build(type: UiControlSchema['type']): UiControlSchema {
    return {
      key: this.path,
      type,
      label: this.draft.label ?? this.path,
      ...this.draft,
    }
  }

  /** Завершить билд как чекбокс. */
  checkbox() { return this.build('checkbox') }

  /** Завершить билд как переключатель (switch). */
  switch() { return this.build('switch') }

  /** Завершить билд как числовое поле. */
  number() { return this.build('number') }

  /** Завершить билд как текстовое поле. */
  text() { return this.build('text') }

  /** Завершить билд как слайдер. */
  slider() { return this.build('slider') }

  /** Завершить билд как обычный селект. */
  select() { return this.build('select') }

  /** Завершить билд как обычный селект. */
  multiSelect() { return this.build('multiSelect') }

  /** Завершить билд как текстовый селект (набор строковых значений). */
  textSelect() { return this.build('textSelect') }

  /** Завершить билд как выбор цвета. */
  color() { return this.build('color') }

  /** Завершить билд как числовой селект (фиксированный набор чисел). */
  numberSelect() { return this.build('numberSelect') }

  /** Завершить билд как многострочное текстовое поле. */
  textarea() { return this.build('textarea') }

  /** Завершить билд как radio-group. */
  radioGroup() { return this.build('radioGroup') }
}

/**
 * Фабрика билдера поля.
 *
 * @param path Полный ключ (dot-path), например: "plotOptions.column.pointWidth"
 * @returns Экземпляр {@link FieldBuilder} для chain-конфигурирования
 *
 * @example
 * ```ts
 * const schemaItem = Field('yAxis.gridLineWidth')
 *   .group('yAxis')
 *   .label('Толщина сетки')
 *   .default(1)
 *   .range(0, 2, 0.1)
 *   .slider()
 * ```
 */
export const Field = (path: string) => new FieldBuilder(path)

/**
 * Проставляет group всем полям и (если нужно) задаёт общий labelAbove первому.
 * Если у элемента уже есть свой group/labelAbove, они не трогаются.
 */
export function section(labelAbove: string | null, groupKey: string) {
  return (...items: UiControlSchema[]): UiControlSchema[] =>
    items.map((i, idx) => ({
      ...i,
      // group подставляем только если его нет — можно локально переопределять при желании
      ...(i.group ? null : { group: groupKey }),
      // labelAbove задаём только первому и только если у него ещё нет своего
      ...(labelAbove && idx === 0 && !i.labelAbove ? { labelAbove } : null),
    }))
}

/** Вариант без общего labelAbove — только массовая подстановка group. */
export function groupOnly(groupKey: string) {
  return (...items: UiControlSchema[]): UiControlSchema[] =>
    items.map(i => (i.group ? i : { ...i, group: groupKey }))
}
