export enum MockDelays {
  FAST = 200,
  MEDIUM = 1000,
  SLOW = 3000,
  VERY_SLOW = 5000,
}

export const DelayPresets = {
  FAST: MockDelays.FAST,
  MEDIUM: MockDelays.MEDIUM,
  SLOW: MockDelays.SLOW,
  VERY_SLOW: MockDelays.VERY_SLOW,
} as const
