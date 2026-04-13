import type { TableProps } from '@tinkerbells/xenon-ui'
import type { Row, RowData, Table } from '@tanstack/react-table'

import * as React from 'react'

export interface DataTableContextProps<TData extends RowData> {
  table: Table<TData>
  refetch?: () => void
  isFetching?: boolean
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>
  align?: TableProps['align']
  alignHeader?: TableProps['align']
  alignBody?: TableProps['align']
  alignFooter?: TableProps['align']
  virtualized?: boolean
}

const DataTableContext = React.createContext<DataTableContextProps<RowData> | null>(null)

export function DataTableProvider<TData extends RowData>({
  children,
  ...contextValue
}: DataTableContextProps<TData> & { children: React.ReactNode }) {
  return (
    <DataTableContext.Provider value={contextValue as unknown as DataTableContextProps<RowData>}>
      {children}
    </DataTableContext.Provider>
  )
}

export function useDataTableContext<TData extends RowData = RowData>(): DataTableContextProps<TData> {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTableContext must be used within a DataTableProvider')
  }
  return context as DataTableContextProps<TData>
}
