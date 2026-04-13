import type { DataTableQueryParams } from '@/shared/ui/table/dataTableTypes'

import { baseUrl } from '@/shared/api/apiConfig'
import { apiClient } from '@/shared/api/apiClient'

import type { GetPosts, GetPostsDto } from './getPostsModel'

import { transformGetPostsDtoToGetPosts } from './getPostsAdapter'

const getPostsQuery = apiClient.injectEndpoints({
  endpoints: ({ query }) => ({
    getPosts: query<GetPosts, DataTableQueryParams>({
      query: params => ({
        url: `${baseUrl}/getPosts`,
        params,
      }),
      transformResponse: (response: GetPostsDto) => transformGetPostsDtoToGetPosts(response),
    }),
  }),
})

export const { useGetPostsQuery } = getPostsQuery
