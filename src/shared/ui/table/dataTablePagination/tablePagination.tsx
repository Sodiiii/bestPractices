import type { Table } from '@tanstack/react-table'
import type { PaginationProps } from '@tinkerbells/xenon-ui'

import { Pagination } from '@tinkerbells/xenon-ui'

import cls from './tablePagination.module.scss'

type TablePaginationProps = {
  table: Table<any>
} & PaginationProps

export function TablePagination({ table, ...rest }: TablePaginationProps) {
  return (
    <Pagination
      showSizeChanger
      defaultPageSize={table.getState().pagination.pageSize}
      className={cls.tablePagination}
      current={table.getState().pagination.pageIndex + 1}
      total={table.getRowCount()}
      showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
      onChange={(page, pageSize) =>
        table.setPagination({ pageSize, pageIndex: page })}
      {...rest}
    />
  )
}
