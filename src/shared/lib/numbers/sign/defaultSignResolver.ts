import type { SignResolver } from '../types'

/**
 * Резолвер знака по умолчанию:
 *   > 0  → "+"
 *   < 0  → "-"
 *   = 0  → ""
 */
export const defaultSignResolver: SignResolver = (value) => {
  if (value > 0)
    return '+'
  if (value < 0)
    return '-'
  return ''
}
