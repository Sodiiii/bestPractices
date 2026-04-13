/**
 * Adding delimiter (spaces by default) between thousands
 * Optional - apply .toFixed() to incoming number
 */
export function divThousands(number?: number, options?: {
  toFixed?: number
  delimiter?: string
}): string {
  const numberStr = options?.toFixed !== undefined
    ? (number ?? 0).toFixed(options.toFixed)
    : (number ?? 0).toString()

  const numberWithSpaces = numberStr.replace(/\B(?=(\d{3})+(?!\d))/g, options?.delimiter || ' ').replace('.', ',')

  return numberWithSpaces
}
