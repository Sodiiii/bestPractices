import type { NumericFormatStringOptions, NumericInput } from '../types'

import { formatNumericValue } from '../format'
import { roundNearZero } from '../round/roundNearZero'

/**
 * Форматирование процентов.
 */
export function formatPercent(value: number): string {
  const formatted = formatNumericValue(value, {
    transform: roundNearZero,
    includeSign: true,
  })

  return `${formatted}%`
} // путь поправь под свой проект

type FormatWithRoundNearZeroOptions = Partial<
  NumericFormatStringOptions & {
    /**
     * Кол-во знаков после запятой для случая |value| >= 1.
     * Пример: fractionDigitsMoreThanOne = 1 → "5,0", "12,3".
     */
    fractionDigitsMoreThanOne?: number
  }
>

/**
 * Форматирование с "умным" округлением около нуля и отдельным
 * контролем количества знаков после запятой для |value| >= 1.
 */
export function formatWithRoundNearZero(
  value: NumericInput,
  opts?: FormatWithRoundNearZeroOptions,
): string {
  const {
    fractionDigitsMoreThanOne = 0,
    transform: _ignoredTransform, // transform здесь игнорируем,
    as: _ignoredAs, // всегда форматируем в строку
    ...restOpts
  } = opts ?? {}

  // Спецслучаи null/undefined отдадим на откуп базовой функции,
  // чтобы сохранить старое поведение.
  if (value === undefined || value === null) {
    return formatNumericValue(value, {
      ...(restOpts as NumericFormatStringOptions),
      as: 'string',
    })
  }

  // 1) Нормализуем вход в число без округления
  const parsed = formatNumericValue(value, {
    ...restOpts,
    as: 'number',
    // identity-transform, чтобы не включилось стандартное округление по fractionDigits
    transform: v => v,
  }) as number

  if (!Number.isFinite(parsed)) {
    return formatNumericValue(parsed, {
      ...(restOpts as NumericFormatStringOptions),
      as: 'string',
    })
  }

  // 2) "Умное" округление
  const rounded = roundNearZero(parsed, fractionDigitsMoreThanOne)

  if (!Number.isFinite(rounded)) {
    return formatNumericValue(rounded, {
      ...(restOpts as NumericFormatStringOptions),
      as: 'string',
    })
  }

  const absRounded = Math.abs(rounded)

  // 3) Решаем, сколько знаков после запятой показывать
  let fractionDigitsForFormat: number | undefined

  if (absRounded >= 1) {
    // Хотим видеть ",0" при fractionDigitsMoreThanOne = 1
    fractionDigitsForFormat = fractionDigitsMoreThanOne
  }
  else if (absRounded === 0) {
    // Для нуля — как указано в исходных опциях (или дефолтный 0)
    fractionDigitsForFormat
      = (opts as NumericFormatStringOptions | undefined)?.fractionDigits
  }
  else {
    // 0 < |x| < 1 — количество знаков берём "как у числа"
    // (0.03 → 2, 0.2 → 1)
    const s = rounded.toString()
    const dotIndex = s.indexOf('.')
    fractionDigitsForFormat = dotIndex >= 0
      ? s.length - dotIndex - 1
      : 0
  }

  // 4) Финальное форматирование уже без transform —
  // используем стандартную механику fractionDigits + toFixed.
  return formatNumericValue(rounded, {
    ...(restOpts as NumericFormatStringOptions),
    as: 'string',
    fractionDigits: fractionDigitsForFormat,
  })
}
