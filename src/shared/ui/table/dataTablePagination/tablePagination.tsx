import type { RowData, Table } from '@tanstack/react-table'
import type { PaginationProps } from '@tinkerbells/xenon-ui'

import { Pagination } from '@tinkerbells/xenon-ui'

import cls from './tablePagination.module.scss'

interface TablePaginationProps<TData extends RowData> extends PaginationProps {
  table: Table<TData>
}

export function TablePagination<TData extends RowData>({ table, ...rest }: TablePaginationProps<TData>) {
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
