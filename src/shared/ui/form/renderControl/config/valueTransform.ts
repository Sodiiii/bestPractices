import type { UiControlSchema } from './control.types'

export function toModel(item: UiControlSchema, v: unknown): unknown {
  const m = item.modifier
  if (!m)
    return v
  return m.toModel ? m.toModel(v) : v
}

export function toControl(item: UiControlSchema, v: unknown): unknown {
  const m = item.modifier
  if (!m)
    return v
  return m.toControl ? m.toControl(v) : v
}
