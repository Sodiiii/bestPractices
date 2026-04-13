import type { TableProps } from '@tinkerbells/xenon-ui'
import type { RowData, Table } from '@tanstack/react-table'

import * as React from 'react'

export type DataTableContextProps<TData extends RowData> = {
  table: Table<TData>
  refetch?: () => void
  isFetching?: boolean
  align?: TableProps['align']
  alignHeader?: TableProps['align']
  alignBody?: TableProps['align']
  alignFooter?: TableProps['align']
  virtualized?: boolean
}

const DataTableContext = React.createContext<DataTableContextProps<any> | null>(null)

export function DataTableProvider<TData extends RowData>({
  children,
  ...contextValue
}: DataTableContextProps<TData> & { children: React.ReactNode }) {
  return (
    <DataTableContext.Provider value={contextValue}>
      {children}
    </DataTableContext.Provider>
  )
}

export function useDataTableContext<TData = unknown>(): DataTableContextProps<TData> {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTableContext must be used within a DataTableProvider')
  }
  return context
}
