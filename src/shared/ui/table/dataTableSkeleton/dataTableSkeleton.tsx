import type { TableProps } from '@tinkerbells/xenon-ui'

import { Flex, Table } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableSkeleton.module.scss'
import { DataTableBodySkeleton } from './dataTableBodySkeleton'
import { DataTableHeaderSkeleton } from './dataTableHeaderSkeleton'
import { DataTablePaginationSkeleton } from './dataTablePaginationSkeleton'

interface DataTableSkeletonProps extends TableProps {
  columns: number
  rowCount?: number
  widths?: (string | number)[]
  pagination?: boolean
  wrapperClassName?: string
}

export function DataTableSkeleton({ columns, widths, rowCount, pagination, wrapperClassName, className, ...rest }: DataTableSkeletonProps) {
  return (
    <Flex vertical justify="space-between" className={cn(cls.dataTableSkeleton, wrapperClassName)}>
      <div className={cls.container}>
        <Table className={cn(cls.table, className)} {...rest}>
          <DataTableHeaderSkeleton columns={columns} widths={widths} />
          <DataTableBodySkeleton columns={columns} rowCount={rowCount} />
        </Table>
      </div>
      {pagination && <DataTablePaginationSkeleton />}
    </Flex>
  )
}
