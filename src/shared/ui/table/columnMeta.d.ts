import '@tanstack/react-table'

type ColumnAlign = 'left' | 'center' | 'right'

declare module '@tanstack/react-table' {
  interface ColumnMeta<_TData, _TValue> {
    align?: ColumnAlign
    alignHeader?: ColumnAlign
    alignCell?: ColumnAlign
    width?: number | string
    weight?: number
  }
}
