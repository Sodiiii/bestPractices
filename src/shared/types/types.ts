export type Scalar = string | number | boolean | null | Date
export type MonthISO = `${number}-${string}-01` // YYYY-MM-01
export interface ValuePoint {
  date: MonthISO
  value: number
}
