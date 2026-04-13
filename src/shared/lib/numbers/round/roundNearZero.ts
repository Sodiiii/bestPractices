/**
 * "Умное" округление для околонулевых значений.
 *
 * Алгоритм:
 * 1) Если |value| >= 1 → округляем до `fractionDigitsMoreThanOne` знаков
 *    после запятой (по умолчанию до целого).
 * 2) Если 0 < |value| < EPS (по умолчанию 0.001) → возвращаем 0.
 * 3) Если EPS <= |value| < 1 → округляем до 1 значащей цифры (significant figure).
 */
export function roundNearZero(
  value: number,
  fractionDigitsMoreThanOne: number = 0,
): number {
  // Не трогаем NaN / Infinity — пусть обрабатываются выше по стеку
  if (!Number.isFinite(value))
    return value

  if (value === 0)
    return 0

  const absInitial = Math.abs(value)

  // Нормализуем число знаков после запятой для |value| >= 1
  const fdRaw = fractionDigitsMoreThanOne
  const fd = Number.isFinite(fdRaw)
    ? Math.max(0, Math.floor(fdRaw))
    : 0

  // 1) Значения "подальше" от нуля — до нужного количества знаков
  if (absInitial >= 1) {
    if (fd === 0) {
      const roundedInt = Math.round(value)
      // На всякий случай избавляемся от -0
      return roundedInt === 0 ? 0 : roundedInt
    }

    const factor = 10 ** fd
    const rounded = Math.round(value * factor) / factor
    return rounded === 0 ? 0 : rounded // убираем -0
  }

  const sign = value < 0 ? -1 : 1
  let abs = absInitial

  // 2) Очень маленькие значения около нуля — в ноль
  const EPS = 1e-3 // 0.001
  if (abs < EPS) {
    return 0
  }

  // 3) Округление до 1 значащей цифры (significant figure)
  //
  //   x = 0.021 → |x| = 0.021
  //   порядок (order) ≈ floor(log10(0.021)) = -2
  //   digits = 1 → factor = 10^(digits - 1 - order) = 10^2 = 100
  //   round(0.021 * 100) / 100 = 0.02
  const order = Math.floor(Math.log10(abs)) // для 0 < abs < 1 → отрицательное
  const significantDigits = 1
  const factor = 10 ** (significantDigits - 1 - order)

  abs = Math.round(abs * factor) / factor

  const result = sign * abs
  // На всякий случай избавляемся от -0
  return result === 0 ? 0 : result
}
