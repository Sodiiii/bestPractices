type RefetchFn = () => Promise<void> | void

const registry = new Map<string, Set<RefetchFn>>()

function normalizeKeys(keys?: string | string[]): string[] {
  if (!keys)
    return []
  return Array.isArray(keys) ? keys : [keys]
}

export function registerRefetch(keys: string | string[], refetch: RefetchFn) {
  for (const key of normalizeKeys(keys)) {
    if (!registry.has(key))
      registry.set(key, new Set())
    registry.get(key)!.add(refetch)
  }
}

export function unregisterRefetch(keys: string | string[], refetch: RefetchFn) {
  for (const key of normalizeKeys(keys)) {
    const set = registry.get(key)
    if (!set)
      continue
    set.delete(refetch)
    if (set.size === 0)
      registry.delete(key)
  }
}

export function refetchByKey(key: string) {
  const set = registry.get(key)
  if (!set)
    return
  for (const refetch of set) {
    void refetch()
  }
}

export function refetchByUrlSubstring(substring: string) {
  for (const [key, set] of registry.entries()) {
    if (!key.includes(substring))
      continue
    for (const refetch of set) {
      void refetch()
    }
  }
}
