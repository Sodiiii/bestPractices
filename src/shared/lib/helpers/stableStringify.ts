function normalizeForStableStringify(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(item => normalizeForStableStringify(item))

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))

    for (const [key, item] of entries)
      out[key] = normalizeForStableStringify(item)

    return out
  }

  return value
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeForStableStringify(value))
}
