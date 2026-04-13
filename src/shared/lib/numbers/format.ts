import type { NumericFormatBaseOptions, NumericFormatNumberOptions, NumericFormatStringOptions, NumericInput } from './types'

import { defaultSignResolver } from './sign/defaultSignResolver'

// ───────────────────────────────────────────────────────────
// Перегрузки
// ───────────────────────────────────────────────────────────

/**
 * Обработка числового значения.
 *
 * @param value - входное значение (number | string | null | undefined).
 * @param options - объект с настройками форматирования.
 *
 * Особые случаи:
 * - value === null:
 *    - всегда трактуется как 0.
 *      • as: "string" (по умолчанию) -> форматированная строка "0", "0,00" и т.п.
 *      • as: "number"               -> число 0.
 * - value === undefined:
 *      • as: "string" (по умолчанию) -> пустая строка "".
 *      • as: "number"               -> NaN.
 */
export function formatNumericValue(
  value: NumericInput,
  options?: NumericFormatStringOptions,
): string

export function formatNumericValue(
  value: NumericInput,
  options: NumericFormatNumberOptions,
): number

// Реализация
export function formatNumericValue(
  value: NumericInput,
  options: NumericFormatBaseOptions & { as?: 'string' | 'number' } = {},
): string | number {
  const {
    fractionDigits,
    decimalSeparator = ',',
    thousandsSeparator = ' ',
    transform,
    normalizeCommaAsDecimal = true,
    stripWhitespace = true,
    includeSign = false,
    signResolver,
    as = 'string',
  } = options

  const returnNumber = as === 'number'

  // ────────────────────────────────────────────────────────
  // Обработка undefined / null
  // ────────────────────────────────────────────────────────

  if (value === undefined) {
    return returnNumber ? Number.NaN : ''
  }

  if (value === null) {
    return finalize(0)
  }

  // ────────────────────────────────────────────────────────
  // Нормализация к числу
  // ────────────────────────────────────────────────────────

  let numeric: number

  if (typeof value === 'number') {
    numeric = value
  }
  else {
    // value: string
    let str = value as string

    if (stripWhitespace) {
      str = str.replace(/\s+/g, '')
    }
    str = str.trim()

    if (!str) {
      return returnNumber ? Number.NaN : ''
    }

    if (normalizeCommaAsDecimal) {
      str = str.replace(',', '.')
    }

    const parsed = Number(str)

    if (Number.isNaN(parsed)) {
      return returnNumber ? Number.NaN : ''
    }

    numeric = parsed
  }

  // ────────────────────────────────────────────────────────
  // transform или округление
  // ────────────────────────────────────────────────────────

  let processed = numeric

  if (transform) {
    processed = transform(processed)
  }
  else {
    const fd = clampFractionDigits(fractionDigits)
    const multiplier = 10 ** fd
    processed = Math.round(processed * multiplier) / multiplier
  }

  // ────────────────────────────────────────────────────────
  // В режиме числа просто возвращаем number
  // ────────────────────────────────────────────────────────

  if (returnNumber) {
    return processed
  }

  // ────────────────────────────────────────────────────────
  // Форматирование строки
  // ────────────────────────────────────────────────────────

  if (!Number.isFinite(processed)) {
    return String(processed)
  }

  // Избавляемся от -0
  const normalized = processed === 0 ? 0 : processed
  const abs = Math.abs(normalized)

  let raw: string

  if (transform) {
    // transform отвечает за точность, берём просто toString()
    raw = abs.toString()
  }
  else {
    const fd = clampFractionDigits(fractionDigits)
    raw = abs.toFixed(fd)
  }

  // Разделяем целую и дробную части
  let integerPart = raw
  let fractionPart: string | undefined

  const dotIndex = raw.indexOf('.')
  if (dotIndex >= 0) {
    integerPart = raw.slice(0, dotIndex)
    fractionPart = raw.slice(dotIndex + 1)
  }

  // Группировка разрядов
  const groupedInteger
    = thousandsSeparator === ''
      ? integerPart
      : integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)

  // Вычисляем префикс знака
  let signPrefix = ''

  if (includeSign) {
    const resolver = signResolver ?? defaultSignResolver
    signPrefix = resolver(normalized)
  }
  else {
    // Старое поведение: только "-" для отрицательных
    signPrefix = normalized < 0 ? '-' : ''
  }

  let result = signPrefix + groupedInteger

  if (fractionPart && fractionPart.length > 0) {
    result += decimalSeparator + fractionPart
  }

  return result

  // ────────────────────────────────────────────────────────
  // Локальные функции
  // ────────────────────────────────────────────────────────

  function finalize(num: number): string | number {
    if (returnNumber) {
      if (transform) {
        return transform(num)
      }
      const fd = clampFractionDigits(fractionDigits)
      const multiplier = 10 ** fd
      return Math.round(num * multiplier) / multiplier
    }

    // as: "string" — переиспользуем общую логику
    return formatNumericValue(num, options as NumericFormatStringOptions)
  }
}

/**
 * Ограничение fractionDigits к допустимому диапазону для toFixed.
 */
function clampFractionDigits(value: number | undefined): number {
  if (value == null || Number.isNaN(value))
    return 0
  if (value < 0)
    return 0
  if (value > 20)
    return 20 // стандартное ограничение toFixed
  return Math.floor(value)
}
