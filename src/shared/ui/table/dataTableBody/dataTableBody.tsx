import type { Cell, Row, RowData } from '@tanstack/react-table'
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'

import { flexRender } from '@tanstack/react-table'
import { Empty, TableBody, TableCell, TableRow } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableBody.module.scss'
import { useDataTableContext } from '../dataTableContext'

interface DataTableBodyPropsVirtualized {
  virtualized: true
  virtualizer: Virtualizer<HTMLDivElement, Element>
}

interface DataTableBodyPropsNonVirtualized {
  virtualized: false
}

type DataTableBodyProps = DataTableBodyPropsVirtualized | DataTableBodyPropsNonVirtualized

interface CellProps<TData extends RowData> {
  cell: Cell<TData, unknown>
}

function DataTableCell<TData extends RowData>({
  cell,
}: CellProps<TData>) {
  const meta = cell.column.columnDef.meta as {
    align?: 'left' | 'center' | 'right'
    alignCell?: 'left' | 'center' | 'right'
  } | undefined
  const align = meta?.alignCell ?? meta?.align
  return (
    <TableCell
      key={cell.id}
      style={{
        minWidth: cell.column.getSize(),
        width: cell.column.getSize() === 150 ? '100%' : cell.column.getSize(),
        maxWidth: '100%',
        textAlign: align,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  )
}

interface RowProps<TData extends RowData> {
  row: Row<TData>
  virtualRow: VirtualItem
  virtualizer: Virtualizer<HTMLDivElement, Element>
}

function DataTableRow<TData extends RowData>({
  row,
  virtualRow,
  virtualizer,
}: RowProps<TData>) {
  const { getRowProps } = useDataTableContext<TData>()
  const rowProps = getRowProps?.(row)
  const { style: rowStyle, ...restRowProps } = rowProps ?? {}

  return (
    <TableRow
      data-index={virtualRow.index}
      ref={node => virtualizer.measureElement(node)} // measure dynamic row height
      key={row.id}
      {...restRowProps}
      style={{
        ...rowStyle,
        display: 'flex',
        position: 'absolute',
        transform: `translateY(${virtualRow.start}px)`,
        width: '100%',
      }}
    >
      {row.getVisibleCells().map(cell => <DataTableCell key={cell.id} cell={cell} />)}
    </TableRow>
  )
}

function DataTableRowNonVirtualized<TData extends RowData>({
  row,
}: { row: Row<TData> }) {
  const { getRowProps } = useDataTableContext<TData>()
  const rowProps = getRowProps?.(row)

  return (
    <TableRow key={row.id} {...rowProps}>
      {row.getVisibleCells().map(cell => <DataTableCell key={cell.id} cell={cell} />)}
    </TableRow>
  )
}

function DataTableBodyVirtualized<TData extends RowData>({
  virtualizer,
}: DataTableBodyPropsVirtualized) {
  const { table } = useDataTableContext<TData>()
  const { rows } = table.getRowModel()

  if (!rows?.length) {
    return (
      <TableBody className={cls.dataTableBody}>
        <TableRow>
          <TableCell className={cls.dataTableBody__empty} colSpan={table.getAllLeafColumns().length}><Empty /></TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody
      className={cn(cls.dataTableBody, virtualizer && cls['dataTableBody--virtualized'])}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index]
        return <DataTableRow key={row.id} row={row} virtualRow={virtualRow} virtualizer={virtualizer} />
      })}
    </TableBody>
  )
}

function DataTableBodyNonVirtualized<TData extends RowData>() {
  const { table } = useDataTableContext<TData>()
  const { rows } = table.getRowModel()

  if (!rows?.length) {
    return (
      <TableBody className={cls.dataTableBody}>
        <TableRow>
          <TableCell className={cls.dataTableBody__empty} colSpan={table.getAllLeafColumns().length}><Empty /></TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody className={cls.dataTableBody}>
      {rows.map(row => (
        <DataTableRowNonVirtualized key={row.id} row={row} />
      ))}
    </TableBody>
  )
}

export function DataTableBody(props: DataTableBodyProps) {
  if (props.virtualized) {
    return <DataTableBodyVirtualized virtualized={props.virtualized} virtualizer={props.virtualizer} />
  }

  return <DataTableBodyNonVirtualized />
}
