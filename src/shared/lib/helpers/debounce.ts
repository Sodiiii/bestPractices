type Debounced<TThis, TArgs extends unknown[]> = ((this: TThis, ...args: TArgs) => void) & {
  cancel: () => void
}

export function debounce<TThis, TArgs extends unknown[]>(
  fn: (this: TThis, ...args: TArgs) => unknown,
  ms = 300,
): Debounced<TThis, TArgs> {
  let timeoutId: ReturnType<typeof setTimeout>

  const debounced = function (this: TThis, ...args: TArgs) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  } as Debounced<TThis, TArgs>

  debounced.cancel = () => clearTimeout(timeoutId)
  return debounced
}
