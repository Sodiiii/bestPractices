import { DataTable } from '@/shared/ui/table'

import cls from './postsTable.module.scss'
import { usePostTable } from './usePostTable'

export function PostsTable() {
  const { table, isLoading, isFetching } = usePostTable()
  return (
    <div className={cls.postsTable}>
      <DataTable table={table} isLoading={isLoading} isFetching={isFetching} pagination />
    </div>
  )
}
