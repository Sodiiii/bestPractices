import type { VirtualizerOptions } from '@tanstack/react-virtual'
import type { RowData, Table as TanstackTable } from '@tanstack/react-table'

import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Flex,
  ScrollArea,
  ScrollBar,
  Spin,
  Table,
} from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTable.module.scss'
import { DataTableBody } from './dataTableBody'
import { DataTableHeader } from './dataTableHeader'
import { DataTableProvider } from './dataTableContext'
import { TablePagination } from './dataTablePagination'
import { DataTableSkeleton } from './dataTableSkeleton'

const SKELETON_CONFIG = {
  columns: 12,
  rowCount: 16,
  widths: [
    '100px',
    '120px',
    '200px',
    '150px',
    '80px',
    '100px',
    '100px',
    '120px',
    '120px',
    '400px',
    '100px',
    '60px',
  ],
} as const

const VIRTUALIZATION_CONFIG = {
  defaultEstimateSize: 33,
  defaultOverscan: 5,
} as const

type DataTableBaseProps<TData extends RowData> = {
  table?: TanstackTable<TData>
  isLoading?: boolean
  skeleton?: React.ReactNode
  pagination?: boolean
  isFetching?: boolean
} & React.ComponentProps<'div'>

type Virtualization<TScrollElement extends Element, TItemElement extends Element> = {
  enabled: boolean
} & Partial<VirtualizerOptions<TScrollElement, TItemElement>>

export type DataTableProps<TData extends RowData>
  = | (DataTableBaseProps<TData> & { virtualization?: Virtualization<HTMLDivElement, HTMLDivElement> & { enabled: false } })
    | (DataTableBaseProps<TData> & { virtualization: Virtualization<HTMLDivElement, HTMLDivElement> & { enabled: true } })

function supportsAccurateMeasurement(): boolean {
  return typeof window !== 'undefined'
    && typeof ResizeObserver !== 'undefined'
    && !navigator.userAgent.includes('Firefox')
}

export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const { table, isLoading, skeleton, className, pagination, ...rest } = props

  if (table && !isLoading) {
    return <DataTableView<TData> table={table} className={className} pagination={pagination} {...rest} />
  }

  return skeleton || (
    <DataTableSkeleton
      size="sm"
      wrapperClassName={cn(cls.dataTable, { [cls['dataTable--pagination']]: pagination }, className)}
      className={cls.table}
      columns={SKELETON_CONFIG.columns}
      rowCount={SKELETON_CONFIG.rowCount}
      widths={[...SKELETON_CONFIG.widths]}
      pagination={pagination}
    />
  )
}

type DataTableViewProps<TData extends RowData> = {
  table: TanstackTable<TData>
  isFetching?: boolean
  pagination?: boolean
  virtualization?: Virtualization<HTMLDivElement, HTMLDivElement>
} & React.ComponentProps<'div'>

function createVirtualizer(
  rows: unknown[],
  parentRef: React.RefObject<HTMLDivElement>,
  virtualization: Virtualization<HTMLDivElement, HTMLDivElement>,
) {
  const { enabled, ...virtualizerOptions } = virtualization

  return useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof virtualizerOptions.estimateSize === 'function'
      ? virtualizerOptions.estimateSize
      : () => VIRTUALIZATION_CONFIG.defaultEstimateSize,
    measureElement: supportsAccurateMeasurement()
      ? element => element?.getBoundingClientRect().height
      : undefined,
    overscan: virtualizerOptions.overscan ?? VIRTUALIZATION_CONFIG.defaultOverscan,
    ...virtualizerOptions,
  })
}

function renderTableContent<TData extends RowData>(
  table: TanstackTable<TData>,
  virtualizationEnabled: boolean,
  virtualizer?: any,
  isFetching?: boolean,
) {
  const { rows } = table.getRowModel()

  return (
    <DataTableProvider
      table={table}
      isFetching={isFetching}
      virtualized={virtualizationEnabled}
    >
      <Table
        size="sm"
        className={cn(
          cls.table,
          {
            [cls.empty]: virtualizationEnabled ? !virtualizer?.getTotalSize() : !rows.length,
            [cls.virtualized]: virtualizationEnabled,
          },
        )}
      >
        <DataTableHeader />
        <DataTableBody virtualized={virtualizationEnabled} virtualizer={virtualizer} />
      </Table>
    </DataTableProvider>
  )
}

export function DataTableView<TData extends RowData>(props: DataTableViewProps<TData>) {
  const {
    table,
    isFetching,
    className,
    pagination,
    virtualization,
  } = props

  const parentRef = React.useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const virtualizationEnabled = virtualization?.enabled ?? false
  const virtualizer = virtualizationEnabled && virtualization
    ? createVirtualizer(rows, parentRef, virtualization)
    : undefined

  return (
    <div className={cn(cls.dataTable, { [cls['dataTable--pagination']]: pagination }, className)}>
      <Flex justify="space-between" vertical className={cls.container}>
        <Spin className={cls.spin} rootClassName={cls.spinRoot} wrapperClassName={cls.spinWrapper} spinning={isFetching}>
          <ScrollArea ref={parentRef} className={cls.scrollArea}>
            {renderTableContent(
              table,
              virtualizationEnabled,
              virtualizer,
              isFetching,
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {pagination && <TablePagination size="small" table={table} />}
        </Spin>
      </Flex>
    </div>
  )
}
