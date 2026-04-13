import type { SelectProps } from '@tinkerbells/xenon-ui'

import { useMemo } from 'react'

import { useDataTable } from '@/shared/ui/table'
import { PostStatus } from '@/entities/post/postModel'
import { PostAdapter } from '@/entities/post/postAdapter'
import { useGetPostsQuery } from '@/features/post/getPosts/getPostsQuery'
import { useDataTableQueryParams } from '@/shared/ui/table/useDataTableQueryParams'

import { getPostsTableColumns } from './postsTableColumns'

export function usePostTable() {
  const { params } = useDataTableQueryParams()
  const { data = { posts: [] }, isLoading, isFetching } = useGetPostsQuery({ ...params })

  const statusOptions: SelectProps['options'] = useMemo(() => {
    return [
      { value: PostStatus.REVIEWING, label: PostAdapter.getStatusText(PostStatus.REVIEWING) },
      { value: PostStatus.PUBLISHED, label: PostAdapter.getStatusText(PostStatus.PUBLISHED) },
      { value: PostStatus.DELETED, label: PostAdapter.getStatusText(PostStatus.DELETED) },
    ]
  }, [])

  const columns = useMemo(() => getPostsTableColumns({ statusOptions }), [])

  const { table } = useDataTable({
    data: data.posts,
    pageCount: data.posts.length,
    columns,
    getRowId: originalRow => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  })
  return { table, isFetching, isLoading }
}
