import type { RowData } from '@tanstack/react-table'

import { flexRender } from '@tanstack/react-table'
import { TableHead, TableHeader, TableRow } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableHeader.module.scss'
import { useDataTableContext } from '../dataTableContext'

export function DataTableHeader<TData extends RowData>() {
  const { table, virtualized } = useDataTableContext<TData>()

  return (
    <TableHeader className={cn(cls.dataTableHeader, virtualized && cls.virtualized)}>
      {table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id} className={cn(cls.row)}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead
                className={cn(cls.head)}
                style={{
                  minWidth: header.getSize(),
                  width: header.getSize(),
                  maxWidth: '100%',
                }}
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
}
