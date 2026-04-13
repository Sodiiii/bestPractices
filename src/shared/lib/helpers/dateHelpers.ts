import type { MonthISO } from '@/shared/types/types'

export type DateOutputFormat = 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'MM.YYYY' | 'DD.MM'

export function parseDate(dateInput: string | Date): Date
export function parseDate(dateInput: string | Date, returnType: 'Date'): Date
export function parseDate(dateInput: string | Date, returnType: 'string', outputFormat?: DateOutputFormat): string
export function parseDate(
  dateInput: string | Date,
  returnType: 'Date' | 'string' = 'Date',
  outputFormat: 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'MM.YYYY' | 'DD.MM' = 'YYYY-MM-DD',
): Date | string {
  let date: Date

  if (dateInput instanceof Date) {
    date = new Date(dateInput) // Создаем копию, чтобы не изменять исходный объект
  }
  else {
    let year: number, month: number, day: number
    const dateStr = dateInput

    if (dateStr.includes('.')) {
      const [d, m, y] = dateStr.split('.')
      day = Number.parseInt(d, 10)
      month = Number.parseInt(m, 10)
      year = Number.parseInt(y, 10)
    }
    else if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts[0].length === 4) {
        // Формат YYYY-MM-DD
        year = Number.parseInt(parts[0], 10)
        month = Number.parseInt(parts[1], 10)
        day = Number.parseInt(parts[2], 10)
      }
      else {
        // Формат dd-MM-yyyy
        day = Number.parseInt(parts[0], 10)
        month = Number.parseInt(parts[1], 10)
        year = Number.parseInt(parts[2], 10)
      }
    }
    else {
      throw new Error(`Unsupported date format: ${dateStr}`)
    }

    date = new Date(year, month - 1, day)
  }

  if (returnType === 'string') {
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // Возвращаем к 1-индексации
    const day = date.getDate()

    const pad = (n: number) => n.toString().padStart(2, '0')

    const monthStr = pad(month)
    const dayStr = pad(day)

    switch (outputFormat) {
      case 'YYYY-MM-DD':
        return `${year}-${monthStr}-${dayStr}`
      case 'DD.MM.YYYY':
        return `${dayStr}.${monthStr}.${year}`
      case 'DD.MM':
        return `${dayStr}.${monthStr}`
      case 'MM.YYYY':
        return `${monthStr}.${year}`
      default:
        throw new Error(`Unsupported output format: ${outputFormat}`)
    }
  }

  return date
}

/**
 * Принимает массив дат или строк-дат
 * Возвращает подмножество этих дат по одному из двух режимов:
 * - Режим "по дням" : beforeCount дней до текущей даты, сама текущая дата, afterCount дней после неё
 * - Режим "по месяцам" : все даты за beforeCount месяцев до текущего месяца, текущий месяц, все даты за afterCount месяцев после
 * Можно указать referenceDate, которая будет использоваться в качестве опорной даты вместе текущей
 */
export function getFilteredDates(
  allDates: Date[] | string[],
  mode: 'days' | 'months',
  beforeCount: number,
  afterCount: number,
  referenceDate: Date = new Date(),
) {
  const now = new Date(referenceDate)
  const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Парсим строки в Date, если нужно
  const dateObjects = allDates.map((date) => {
    if (typeof date === 'string') {
      return parseDate(date, 'Date') as Date
    }
    return date
  })

  // Сортируем входные даты
  const sortedDates = [...dateObjects].sort((a, b) => a.getTime() - b.getTime())

  if (mode === 'days') {
    const beforeDates: Date[] = []
    const afterDates: Date[] = []

    for (const date of sortedDates) {
      if (date < normalizedNow) {
        beforeDates.push(date)
      }
      else {
        afterDates.push(date)
      }
    }

    // Ближайшая к опорной дата
    let closestToNow: Date | null = null
    let minDiff = Infinity

    for (const date of [...beforeDates, ...afterDates]) {
      const diff = Math.abs(date.getTime() - normalizedNow.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closestToNow = date
      }
    }

    // Фильтруем ближайшие beforeCount и afterCount дат
    const resultBefore = beforeCount > 0 ? beforeDates.slice(-beforeCount) : []
    const resultAfter = afterCount > 0 ? afterDates.filter(d => d > (closestToNow || normalizedNow)) : []

    return {
      before: resultBefore,
      current: closestToNow,
      after: resultAfter.slice(0, afterCount),
    }
  }

  if (mode === 'months') {
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const minDate = new Date(currentYear, currentMonth - beforeCount, 1)
    const maxDate = new Date(currentYear, currentMonth + afterCount + 1, 0) // последний день

    const filtered = sortedDates.filter(date => date >= minDate && date <= maxDate)

    // Разделяем на before, current, after по месяцам
    const before: Date[] = []
    const after: Date[] = []
    const current: Date[] = []

    for (const date of filtered) {
      const year = date.getFullYear()
      const month = date.getMonth()

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        before.push(date)
      }
      else if (year === currentYear && month === currentMonth) {
        current.push(date)
      }
      else {
        after.push(date)
      }
    }

    // Берём ближайшую к опорной дате из текущего месяца
    let closestInCurrent: Date | null = null
    let minDiff = Infinity

    for (const date of current) {
      const diff = Math.abs(date.getTime() - normalizedNow.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closestInCurrent = date
      }
    }

    return {
      before,
      current: closestInCurrent,
      after,
    }
  }

  return {
    before: [],
    current: new Date(),
    after: [],
  }
}

// Функция для генерации дат в диапазоне
export function getDates(
  startDate: Date,
  endDate: Date,
  count: number,
  sequential: boolean = false,
): Date[] {
  const dates: Date[] = []
  const timeDiff = endDate.getTime() - startDate.getTime()

  if (sequential) {
    // Генерируем даты строго друг за другом с одинаковым интервалом
    const step = timeDiff / (count - 1) // равные шаги между точками
    for (let i = 0; i < count; i++) {
      dates.push(new Date(startDate.getTime() + i * step))
    }
  }
  else {
    // Генерируем случайные даты и сортируем их
    for (let i = 0; i < count; i++) {
      const randomTime = startDate.getTime() + Math.random() * timeDiff
      dates.push(new Date(randomTime))
    }
    dates.sort((a, b) => a.getTime() - b.getTime())
  }

  return dates
}

/**
 * Возвращает "текущую" дату в указанном году
 */
export function getDateBasedOnYear(yearStr: string): Date {
  const now = new Date()
  const currentYear = now.getFullYear()
  const targetYear = Number.parseInt(yearStr, 10)

  if (Number.isNaN(targetYear)) {
    throw new TypeError('Invalid year format. Expected a string like "2025".')
  }

  if (targetYear === currentYear) {
    return new Date() // Возвращаем сегодняшнюю дату
  }

  // Создаём дату с тем же месяцем и числом, но нужным годом
  const sameMonthDay = new Date(now)
  sameMonthDay.setFullYear(targetYear)

  return sameMonthDay
}

interface DateOptions {
  monthFormat?: 'long' | 'short' | 'numeric'
  dayFormat?: '2-digit' | 'numeric'
}

interface OutputDate {
  year: number
  month: string
  day: string | number
  quarter: string
}

/**
 * Возвращает форматированное значение дня, месяца и года от переданной даты (по умолчанию - от текущей)
 * Так же возвращает номер текущего квартала
 */
export function getDateParts(
  date: Date = new Date(),
  options: DateOptions = {},
): OutputDate {
  const { monthFormat = 'numeric', dayFormat = 'numeric' } = options

  const d = new Date(date)

  const year = d.getFullYear()
  const monthNumber = d.getMonth()
  const dayNumber = d.getDate()
  const quarter = `${Math.ceil((monthNumber + 1) / 3)}`

  let monthValue: string = `${monthNumber + 1}`

  if (monthFormat === 'long') {
    const longMonth = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(d)
    monthValue = longMonth.charAt(0).toUpperCase() + longMonth.slice(1) // "Январь", а не "январь"
  }
  else if (monthFormat === 'short') {
    const shortMonth = new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(d)
    monthValue = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1) // "Янв"
  }

  let dayValue: string | number = dayNumber

  if (dayFormat === '2-digit') {
    dayValue = dayNumber.toString().padStart(2, '0') // "05"
  }

  return {
    year,
    month: monthValue,
    day: dayValue,
    quarter,
  }
}

/**
 * Фильтрует даты по указанному периоду (месяц, квартал, год).
 * @param allDates Массив дат или строк, которые можно преобразовать в даты.
 * @param mode Режим периода: 'month', 'quarter' или 'year'.
 * @param period Параметры периода:
 *   - Для режима 'month': { month: число (0-11), year: число }
 *   - Для режима 'quarter': { quarter: число (1-4), year: число }
 *   - Для режима 'year': { year: число }
 * @param period.month Месяц (0-11) для режима `month`.
 * @param period.year Год выбранного периода.
 * @returns Массив дат, попадающих в указанный период.
 */
export function getDatesInPeriod(allDates: (Date | string)[], mode: 'month', period: { month: number, year: number }): Date[]
export function getDatesInPeriod(allDates: (Date | string)[], mode: 'quarter', period: { quarter: number, year: number }): Date[]
export function getDatesInPeriod(allDates: (Date | string)[], mode: 'year', period: { year: number }): Date[]
export function getDatesInPeriod(
  allDates: (Date | string)[],
  mode: 'month' | 'quarter' | 'year',
  period: { month: number, year: number } | { quarter: number, year: number } | { year: number },
): Date[] {
  // Преобразуем все элементы в объекты Date
  const dateObjects = allDates.map((date) => {
    if (typeof date === 'string') {
      return parseDate(date, 'Date') as Date
    }
    return date
  })

  // Определяем границы периода
  let startDate: Date
  let endDate: Date

  if (mode === 'month') {
    const { month, year } = period as { month: number, year: number }
    startDate = new Date(year, month, 1, 0, 0, 0, 0)
    endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
  }
  else if (mode === 'quarter') {
    const { quarter, year } = period as { quarter: number, year: number }
    const startMonth = (quarter - 1) * 3
    startDate = new Date(year, startMonth, 1, 0, 0, 0, 0)
    endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  }
  else { // mode === 'year'
    const { year } = period as { year: number }
    startDate = new Date(year, 0, 1, 0, 0, 0, 0)
    endDate = new Date(year, 12, 0, 23, 59, 59, 999)
  }

  // Фильтруем даты, попадающие в период
  return dateObjects.filter(date =>
    date >= startDate && date <= endDate,
  ).sort((a, b) => a.getTime() - b.getTime())
}

/**
 * Группирует данные по указанным полям, сохраняя структуру для последующей агрегации
 * @param data Массив объектов для группировки
 * @param groupKeys Ключи, по которым нужно группировать данные
 * @returns Массив сгруппированных данных, где каждая группа содержит исходные данные
 */
export function groupByFields<T extends Record<string, unknown>>(
  data: T[],
  groupKeys: (keyof T)[],
): { groupKey: string, items: T[] }[] {
  const groups = new Map<string, T[]>()

  for (const item of data) {
    // Создаем ключ группировки из значений указанных полей
    const groupKey = groupKeys
      .map(key => String(item[key]))
      .join('|')

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(item)
  }

  // Преобразуем Map в массив объектов
  return Array.from(groups.entries()).map(([groupKey, items]) => ({
    groupKey,
    items,
  }))
}

/**
 * Агрегирует данные по месяцам для нескольких полей
 * @param data Массив объектов с датами и значениями
 * @param dateKey Ключ в объекте, содержащий дату (string | Date)
 * @param valueKeys Массив ключей, по которым нужно агрегировать значения
 * @param aggregator Функция агрегации (по умолчанию - сумма)
 * @returns Массив объектов с годом, месяцем и агрегированными значениями
 */
type AggregateByMonthResult<T extends Record<string, unknown>> = {
  year: number
  month: number
} & Partial<Record<keyof T, unknown>>

export function aggregateByMonth<T extends Record<string, unknown>>(
  data: T[],
  dateKey: keyof T,
  valueKeys: (keyof T)[],
  aggregator: (values: number[]) => number = values =>
    values.reduce((sum, val) => sum + val, 0),
): AggregateByMonthResult<T>[] {
  interface MonthAggregateGroup {
    values: Partial<Record<keyof T, number[]>>
    metadata: Partial<Record<keyof T, unknown>>
  }

  const monthMap = new Map<string, MonthAggregateGroup>()

  // Группируем значения по месяцам
  for (const item of data) {
    const dateValue = item[dateKey]
    const date = typeof dateValue === 'string' ? parseDate(dateValue) : dateValue

    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      continue // Пропускаем некорректные даты
    }

    const year = date.getFullYear()
    const month = date.getMonth()
    const mapKey = `${year}-${month}`

    const currentGroup = monthMap.get(mapKey) ?? {
      values: {} as Partial<Record<keyof T, number[]>>,
      metadata: {} as Partial<Record<keyof T, unknown>>,
    }

    // Заполняем агрегируемые поля
    for (const key of valueKeys) {
      const value = Number(item[key])
      if (Number.isNaN(value))
        continue

      if (!currentGroup.values[key]) {
        currentGroup.values[key] = []
      }
      currentGroup.values[key]?.push(value)
    }

    // Заполняем остальные поля (берём первое попавшееся значение)
    for (const key in item) {
      const typedKey = key as keyof T
      if (valueKeys.includes(typedKey) || typedKey === dateKey)
        continue

      if (!(typedKey in currentGroup.metadata)) {
        currentGroup.metadata[typedKey] = item[typedKey]
      }
    }

    monthMap.set(mapKey, currentGroup)
  }

  // Агрегируем значения для каждого месяца
  const result: AggregateByMonthResult<T>[] = []

  for (const [key, group] of monthMap.entries()) {
    const [year, month] = key.split('-').map(Number)

    const aggregatedValues: Partial<Record<keyof T, number>> = {}
    for (const key of valueKeys) {
      const values = group.values[key] || []
      aggregatedValues[key] = aggregator(values)
    }

    result.push({
      year,
      month,
      ...aggregatedValues,
      ...group.metadata,
    })
  }

  // Сортируем по году и месяцу
  return result.sort((a, b) => {
    if (a.year !== b.year)
      return a.year - b.year
    return a.month - b.month
  })
}

// Вспомогательная функция для проверки JSON строки
function isJsonString(str: string): boolean {
  try {
    JSON.parse(str)
  }
  catch (e) {
    console.warn(e)
    return false
  }
  return true
}

/**
 * Агрегирует данные по указанному полю для нескольких значений
 * @param data Массив объектов с данными
 * @param groupByKey Ключ в объекте, по которому нужно группировать данные
 * @param valueKeys Массив ключей, по которым нужно агрегировать значения
 * @param aggregator Функция агрегации (по умолчанию - сумма)
 * @returns Массив объектов с ключом группировки и агрегированными значениями
 */
type AggregateByFieldResult<T extends Record<string, unknown>> = {
  groupValue: unknown
} & Partial<Record<keyof T, unknown>>

export function aggregateByField<T extends Record<string, unknown>>(
  data: T[],
  groupByKey: keyof T,
  valueKeys: (keyof T)[],
  aggregator: (values: number[]) => number = values =>
    values.reduce((sum, val) => sum + val, 0),
): AggregateByFieldResult<T>[] {
  interface FieldAggregateGroup {
    values: Partial<Record<keyof T, number[]>>
    metadata: Partial<Record<keyof T, unknown>>
  }

  const groupMap = new Map<unknown, FieldAggregateGroup>()

  // Группируем значения по указанному полю
  for (const item of data) {
    const groupValue = item[groupByKey]
    const mapKey = typeof groupValue === 'object' ? JSON.stringify(groupValue) : groupValue

    const currentGroup = groupMap.get(mapKey) ?? {
      values: {} as Partial<Record<keyof T, number[]>>,
      metadata: {} as Partial<Record<keyof T, unknown>>,
    }

    // Заполняем агрегируемые поля
    for (const key of valueKeys) {
      const value = Number(item[key])
      if (Number.isNaN(value))
        continue

      if (!currentGroup.values[key]) {
        currentGroup.values[key] = []
      }
      currentGroup.values[key]?.push(value)
    }

    // Заполняем остальные поля (берём первое попавшееся значение)
    for (const key in item) {
      const typedKey = key as keyof T
      if (valueKeys.includes(typedKey) || typedKey === groupByKey)
        continue

      if (!(typedKey in currentGroup.metadata)) {
        currentGroup.metadata[typedKey] = item[typedKey]
      }
    }

    groupMap.set(mapKey, currentGroup)
  }

  // Агрегируем значения для каждой группы
  const result: AggregateByFieldResult<T>[] = []

  for (const [groupValue, group] of groupMap.entries()) {
    const parsedGroupValue = typeof groupValue === 'string' && isJsonString(groupValue)
      ? JSON.parse(groupValue)
      : groupValue

    const aggregatedValues: Partial<Record<keyof T, number>> = {}
    for (const key of valueKeys) {
      const values = group.values[key] || []
      aggregatedValues[key] = aggregator(values)
    }

    result.push({
      groupValue: parsedGroupValue,
      ...aggregatedValues,
      ...group.metadata,
    })
  }

  return result
}

/**
 * Агрегирует сгруппированные данные по месяцам (совместима с выводом groupByFields)
 * @param groupedData Сгруппированные данные от groupByFields
 * @param dateKey Ключ в объекте, содержащий дату
 * @param valueKeys Ключи для агрегации
 * @param aggregator Функция агрегации
 * @returns Массив агрегированных данных с сохранением группировки
 */
export function aggregateGroupedByMonth<T extends Record<string, unknown>>(
  groupedData: { groupKey: string, items: T[] }[],
  dateKey: keyof T,
  valueKeys: (keyof T)[],
  aggregator: (values: number[]) => number = values => values.reduce((sum, val) => sum + val, 0),
): { groupKey: string, aggregatedData: ReturnType<typeof aggregateByMonth<T>> }[] {
  return groupedData.map(group => ({
    groupKey: group.groupKey,
    aggregatedData: aggregateByMonth(group.items, dateKey, valueKeys, aggregator),
  }))
}

/**
 * Агрегирует сгруппированные данные по одинаковым полям (совместима с выводом groupByFields)
 * @param groupedData Сгруппированные данные от groupByFields
 * @param groupKey Ключ в объекте, содержащий дату
 * @param valueKeys Ключи для агрегации
 * @param aggregator Функция агрегации
 * @returns Массив агрегированных данных с сохранением группировки
 */
export function aggregateGrouped<T extends Record<string, unknown>>(
  groupedData: { groupKey: string, items: T[] }[],
  groupKey: keyof T,
  valueKeys: (keyof T)[],
  aggregator: (values: number[]) => number = values => values.reduce((sum, val) => sum + val, 0),
): { groupKey: string, aggregatedData: ReturnType<typeof aggregateByField<T>> }[] {
  return groupedData.map(group => ({
    groupKey: group.groupKey,
    aggregatedData: aggregateByField(group.items, groupKey, valueKeys, aggregator),
  }))
}

/** Локальный ISO YYYY-MM-DD (без UTC-сдвигов). */
export function isoLocal(y: number, m0: number, d: number) {
  return `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Короткое имя месяца на русском без точки: "янв", "фев", ... */
export function ruMonthShort(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(d).replace('.', '')
}

/** Дней в месяце для (y, m0) */
export const daysInMonth = (y: number, m0: number) => new Date(y, m0 + 1, 0).getDate()

/**
 * Список дней выбранного месяца (локально).
 * Если clampToToday=true и выбран текущий месяц — ограничиваем по сегодняшнему числу.
 */
export function buildMonthDays(params: { year?: number, month?: number, clampToToday?: boolean } = {}): string[] {
  const now = new Date()
  const y = params.year ?? now.getFullYear()
  const m0 = params.month ?? now.getMonth()
  const clamp = params.clampToToday ?? true

  let last = daysInMonth(y, m0)
  if (clamp && y === now.getFullYear() && m0 === now.getMonth()) {
    last = now.getDate()
  }

  const out: string[] = []
  for (let day = 1; day <= last; day++) out.push(isoLocal(y, m0, day))
  return out
}

/**
 * YTD месяцы:
 * - rollingYear=true: от того же месяца прошлого года (включительно) до текущего (включительно)
 * - rollingYear=false: с января текущего года до текущего месяца (включительно)
 */
export function buildYtdMonths(rollingYear: boolean): string[] {
  const now = new Date()
  const yNow = now.getFullYear()
  const mNow = now.getMonth()

  const start = rollingYear ? new Date(yNow - 1, mNow, 1) : new Date(yNow, 0, 1)
  const end = new Date(yNow, mNow, 1)

  const out: string[] = []
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    out.push(isoLocal(d.getFullYear(), d.getMonth(), 1))
  }
  return out
}

/**
 * 1 января указанного года.
 *
 * Примеры:
 *   getFirstDayOfYear(2025)                      // Date
 *   getFirstDayOfYear('2025', 'string')          // "2025-01-01"
 *   getFirstDayOfYear(2025, 'string', 'DD.MM')   // "01.01"
 */
export function getFirstDayOfYear(year: number | string): Date
export function getFirstDayOfYear(year: number | string, returnType: 'Date'): Date
export function getFirstDayOfYear(
  year: number | string,
  returnType: 'string',
  outputFormat?: DateOutputFormat,
): string
export function getFirstDayOfYear(
  year: number | string,
  returnType: 'Date' | 'string' = 'Date',
  outputFormat: DateOutputFormat = 'YYYY-MM-DD',
): Date | string {
  const y = typeof year === 'string' ? Number.parseInt(year, 10) : year

  if (!Number.isFinite(y)) {
    throw new TypeError('Invalid year. Expected a number or string like "2025".')
  }

  // Нормализуем к локальной дате 1 января (00:00:00)
  const date = new Date(y, 0, 1)

  if (returnType === 'Date') {
    return date
  }

  // Переиспользуем твой parseDate для форматирования
  return parseDate(date, 'string', outputFormat) as string
}

/**
 * Сегодняшняя дата в указанном формате.
 *
 * Примеры:
 *   getToday()                             // Date
 *   getToday('string')                     // "2025-11-11"
 *   getToday('string', 'DD.MM.YYYY')       // "11.11.2025"
 */
export function getToday(): Date
export function getToday(returnType: 'Date'): Date
export function getToday(returnType: 'string', outputFormat?: DateOutputFormat): string
export function getToday(
  returnType: 'Date' | 'string' = 'Date',
  outputFormat: DateOutputFormat = 'YYYY-MM-DD',
): Date | string {
  const now = new Date()
  // Нормализуем до начала дня, чтобы не тащить время
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (returnType === 'Date') {
    return date
  }

  return parseDate(date, 'string', outputFormat) as string
}

export const now = new Date()

const yesterday = new Date(now)
yesterday.setDate(now.getDate() - 1)
export { yesterday }

export const currentYear = new Date().getFullYear()

export function getCurrentYearMonthFirstDay(): MonthISO {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/**
 * Первое число текущего месяца в формате YYYY-MM-01
 */
export const currentMonth = getCurrentYearMonthFirstDay()

export function formatMonth(month: number, type: 'full' | 'short' = 'full') {
  const full = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]
  const short = [
    'янв.',
    'февр.',
    'мар.',
    'апр.',
    'мая',
    'июн.',
    'июл.',
    'авг.',
    'сент.',
    'окт.',
    'нояб.',
    'дек.',
  ]

  return type === 'full' ? full[month] : short[month]
}

export function formatDateVerboseRU(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
} // "1 ноября"

export function formatDateVerboseRUMonth(iso: string, variant: 'long' | 'short' = 'long') {
  return new Date(iso).toLocaleDateString('ru-RU', { month: variant })
} // "ноябрь"

export function monthName(d = new Date(), offset = 0) {
  return formatDateVerboseRUMonth(
    parseDate(new Date(d.getFullYear(), d.getMonth() + offset, 1), 'string', 'YYYY-MM-DD'),
  )
}
