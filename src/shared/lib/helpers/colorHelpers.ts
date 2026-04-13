/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-useless-assertions */
/* eslint-disable max-statements-per-line */
/* eslint-disable style/max-statements-per-line */
/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable regexp/no-unused-capturing-group */
export function getCssVariableValue(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

export function extractCssVariable(variableStr: string): string | null {
  const match = variableStr.match(/^var\(\s*(--[^)]+)\s*\)$/)
  return match ? match[1].trim() : null
}

export function setAlpha(color: string, alpha: number): string {
  // нормализуем alpha в диапазон [0, 1]
  const a = Math.max(0, Math.min(1, alpha))

  // 1) Поддержка CSS-переменных: var(--name)
  let src = color.trim()
  if (src.startsWith('var')) {
    const varName = extractCssVariable(src)
    if (varName) {
      src = getCssVariableValue(varName) || src
    }
  }

  // 2) Если HEX (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
  if (/^#([0-9a-f]{3,8})$/i.test(src)) {
    const hex = src.replace('#', '').toLowerCase()

    const expand = (h: string) =>
      h.length === 1 ? h + h : h // для удобства при #RGB/#RGBA после разворота

    let r = 0; let g = 0; let b = 0
    if (hex.length === 3 || hex.length === 4) {
      // #RGB или #RGBA
      const [hr, hg, hb] = [expand(hex[0]), expand(hex[1]), expand(hex[2])]
      r = Number.parseInt(hr, 16)
      g = Number.parseInt(hg, 16)
      b = Number.parseInt(hb, 16)
      // alpha из #RGBA игнорируем — берём переданный a
    }
    else if (hex.length === 6 || hex.length === 8) {
      // #RRGGBB или #RRGGBBAA
      r = Number.parseInt(hex.slice(0, 2), 16)
      g = Number.parseInt(hex.slice(2, 4), 16)
      b = Number.parseInt(hex.slice(4, 6), 16)
      // alpha из #RRGGBBAA игнорируем — берём переданный a
    }
    else {
      console.warn(`Invalid HEX color: ${color}`)
      return color
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  // 3) Если rgb()/rgba() — поддерживаем оба синтаксиса: через пробелы и через запятые,
  //    а также необязательный альфа-канал и проценты каналов
  const normalized = src
    .replace(/\s*\/\s*/, '/') // нормализуем слэш
    .replace(/\s+/g, ' ') // множественные пробелы -> один
    .trim()

  const match = normalized.match(
    /^rgba?\(\s*(\d+%?)\s+(\d+%?)\s+(\d+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$|^rgba?\(\s*(\d+%?)\s*,\s*(\d+%?)\s*,\s*(\d+%?)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  )

  if (match) {
    const r = match[1] || match[5]
    const g = match[2] || match[6]
    const b = match[3] || match[7]

    if (!r || !g || !b) {
      console.warn(`Invalid color components in: ${color}`)
      return color
    }
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  console.warn(`Unsupported color format: ${color}`)
  return color
}

export function rgbToHex(rgbStr: string): string {
  // Регулярное выражение для парсинга:
  // - rgb(50 180 255 / 100%)
  // - rgba(255, 255, 255, 1)
  // - rgb(255, 255, 255)
  const regex = /^rgba?$$(\d+%?)\s+(\d+%?)\s+(\d+%?)(?:\s*\/\s*([\d.]+%?))?$$|^rgba?$$(\d+%?)\s*,\s*(\d+%?)\s*,\s*(\d+%?)(?:\s*,\s*([\d.]+%?))?$$/i
  const match = rgbStr.trim().match(regex)

  if (!match) {
    throw new Error(`Invalid color format: ${rgbStr}`)
  }

  // Извлекаем R, G, B и A
  const [rStr, gStr, bStr, aStr] = [
    match[1] || match[5],
    match[2] || match[6],
    match[3] || match[7],
    match[4] || match[8],
  ]

  // Функция преобразования процента в число
  const parseChannel = (value: string): number => {
    if (value.endsWith('%')) {
      const percent = Number.parseFloat(value)
      return (percent / 100) * 255
    }
    return Number.parseInt(value, 10)
  }

  const r = Math.max(0, Math.min(255, parseChannel(rStr)))
  const g = Math.max(0, Math.min(255, parseChannel(gStr)))
  const b = Math.max(0, Math.min(255, parseChannel(bStr)))

  let a = 1
  if (aStr) {
    if (aStr.endsWith('%')) {
      a = Math.max(0, Math.min(1, Number.parseFloat(aStr) / 100))
    }
    else {
      a = Math.max(0, Math.min(1, Number.parseFloat(aStr)))
    }
  }

  // Преобразование числа в 2-символьный hex
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  // Если альфа не 100%, добавляем её в HEX (8 символов)
  if (a < 0.999) {
    const alphaHex = toHex(a * 255)
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Основная функция конвертации цвета в HEX
export function convertColorToHex(color: string): string {
  let colorStr = color

  // Если это CSS-переменная — получаем её значение
  if (color.startsWith('var')) {
    const varName = extractCssVariable(color)
    if (!varName) {
      console.warn(`Failed to extract CSS variable from: ${color}`)
      return color
    }
    colorStr = getCssVariableValue(varName)
  }

  try {
    return rgbToHex(colorStr)
  }
  catch (e) {
    console.warn(`Error converting color to HEX:`, e)
    return color
  }
}

export function resolveColorString(color: string): string {
  if (!color)
    return ''
  const variableName = extractCssVariable(color)
  if (variableName) {
    return getCssVariableValue(variableName)
  }
  return color
}

/** Нормализует input: var(--x) -> реальный цвет, убирает лишние пробелы */
function resolveColor(input: string): string {
  let c = input.trim()
  // поддержка CSS-переменных
  if (c.startsWith('var(')) {
    const varName = extractCssVariable(c)
    if (varName) {
      const v = getCssVariableValue(varName)
      if (v)
        c = v.trim()
    }
  }
  return c
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

/** Универсальный парсер цвета → [r,g,b,a]; понимает hex, rgb/rgba (оба синтаксиса), именованные цвета */
function parseToRgba(input: string): [number, number, number, number] {
  const src = resolveColor(input)

  // 1) HEX
  const mHex = src.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (mHex) {
    const hex = mHex[1].toLowerCase()
    const expand = (h: string) => (h.length === 1 ? h + h : h)

    let r = 0
    let g = 0
    let b = 0
    let a = 255
    if (hex.length === 3 || hex.length === 4) {
      const rr = expand(hex[0])
      const gg = expand(hex[1])
      const bb = expand(hex[2])
      r = Number.parseInt(rr, 16)
      g = Number.parseInt(gg, 16)
      b = Number.parseInt(bb, 16)
      if (hex.length === 4)
        a = Number.parseInt(expand(hex[3]), 16)
    }
    else {
      r = Number.parseInt(hex.slice(0, 2), 16)
      g = Number.parseInt(hex.slice(2, 4), 16)
      b = Number.parseInt(hex.slice(4, 6), 16)
      if (hex.length === 8)
        a = Number.parseInt(hex.slice(6, 8), 16)
    }
    return [r, g, b, a / 255]
  }

  // 2) rgb()/rgba() — оба синтаксиса (через пробелы или запятые), проценты поддерживаем
  const norm = src.replace(/\s*\/\s*/, '/').replace(/\s+/g, ' ').trim()
  const mRgb = norm.match(
    /^rgba?\(\s*(\d+%?)\s+(\d+%?)\s+(\d+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$|^rgba?\(\s*(\d+%?)\s*,\s*(\d+%?)\s*,\s*(\d+%?)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  )
  if (mRgb) {
    const rStr = (mRgb[1] ?? mRgb[5])!
    const gStr = (mRgb[2] ?? mRgb[6])!
    const bStr = (mRgb[3] ?? mRgb[7])!
    const aStr = (mRgb[4] ?? mRgb[8]) ?? null

    const parseCh = (v: string) =>
      v.endsWith('%') ? Math.round((Number.parseFloat(v) / 100) * 255) : Math.max(0, Math.min(255, Number.parseInt(v, 10)))

    const r = parseCh(rStr)
    const g = parseCh(gStr)
    const b = parseCh(bStr)

    let a = 1
    if (aStr != null) {
      a = aStr.endsWith('%') ? clamp01(Number.parseFloat(aStr) / 100) : clamp01(Number.parseFloat(aStr))
    }
    return [r, g, b, a]
  }

  // 3) Именованные цвета и любые поддерживаемые браузером — через canvas нормализацию
  const ctx = document.createElement('canvas').getContext('2d')!
  try {
    ctx.fillStyle = src // пусть браузер распарсит
    // браузер нормализует в hex #rrggbb
    const hex = ctx.fillStyle
    const [r, g, b, a] = parseToRgba(hex) // рекурсивно в ветку HEX
    return [r, g, b, a]
  }
  catch {
    // Фолбэк — чёрный, чтобы не сломать UI
    console.warn(`colorMix: unsupported color "${input}", fallback to black`)
    return [0, 0, 0, 1]
  }
}

/**
 * colorMix — аналог CSS color-mix(in srgb, c1 p1, c2 p2)
 * @param color1 — первый цвет (можно var(--x), hex, rgb(), имя)
 * @param color2 — второй цвет
 * @param weight — доля первого цвета: 0..1 или строка вида '6%' (по умолчанию 0.06 = 6%)
 * @returns rgba(r,g,b,a) строка
 */
export function colorMix(color1: string, color2: string, weight: number | string = 0.06): string {
  const w = typeof weight === 'string'
    ? clamp01(Number.parseFloat(weight) / 100)
    : clamp01(weight)

  const [r1, g1, b1, a1] = parseToRgba(color1)
  const [r2, g2, b2, a2] = parseToRgba(color2)

  const r = Math.round(r1 * w + r2 * (1 - w))
  const g = Math.round(g1 * w + g2 * (1 - w))
  const b = Math.round(b1 * w + b2 * (1 - w))
  const a = +(a1 * w + a2 * (1 - w)).toFixed(4)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}
