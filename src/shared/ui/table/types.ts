import type { Scalar } from '@/shared/types/types'

/**
 * Строка таблицы для простого фильтра.
 * id — стабильный ключ строки (String(value)).
 */
export interface SimpleTableRow {
  id: string
  value: Scalar
  label: string
}
