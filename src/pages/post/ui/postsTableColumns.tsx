import type { SelectProps } from '@tinkerbells/xenon-ui'

import { Tag } from '@tinkerbells/xenon-ui'
import { createColumnHelper } from '@tanstack/react-table'

import type { Post, PostStatus } from '@/entities/post/postModel'

import { PostAdapter } from '@/entities/post/postAdapter'
import { DateFormat, dateFormatter } from '@/shared/lib/dateFormatter'
import { DataTableColumnHeader } from '@/shared/ui/table/dataTableColumnHeader'

export type GetPostsTableColumnsProps = {
  statusOptions: SelectProps['options']
}

const columnHelper = createColumnHelper<Post>()

export function getPostsTableColumns({ statusOptions }: GetPostsTableColumnsProps) {
  return [
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} filter={{ type: 'date' }}>
          Дата создания
        </DataTableColumnHeader>
      ),
      cell: (info) => {
        const value = info.getValue()
        return value ? dateFormatter.format(value, DateFormat.DATETIME_SHORT) : ''
      },
      size: 200,
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} filter={{ type: 'text' }}>
          Загаловок
        </DataTableColumnHeader>
      ),
      cell: info => info.getValue(),
      size: 200,
    }),
    columnHelper.accessor('author', {
      id: 'author',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} filter={{ type: 'text' }}>
          Автор
        </DataTableColumnHeader>
      ),
      cell: info => PostAdapter.getAuthorFullName(info.getValue()),
      size: 200,
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          filter={{
            type: 'select',
            options: statusOptions,
            value: PostAdapter.getStatusText(column.getFilterValue() as PostStatus),
          }}
        >
          Статус
        </DataTableColumnHeader>
      ),
      cell: (info) => {
        const status = info.getValue()
        return <Tag color={PostAdapter.getStatusColor(status)}>{PostAdapter.getStatusText(status)}</Tag>
      },
      size: 200,
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} filter={{ type: 'text' }}>
          Описание
        </DataTableColumnHeader>
      ),
      cell: info => info.getValue(),
    }),
  ]
}
