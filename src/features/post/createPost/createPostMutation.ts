import type { PostDto } from '@/entities/post/postModel'

import { baseUrl } from '@/shared/api/apiConfig'
import { apiClient } from '@/shared/api/apiClient'

import type { CreatePost } from './createPostModel'

import { transformCreatePostToCreatePostDto } from './createPostAdapter'

const createPostMutation = apiClient.injectEndpoints({
  endpoints: ({ mutation }) => ({
    createPost: mutation<PostDto, CreatePost>({
      query: req => ({
        url: `${baseUrl}/createPost`,
        body: transformCreatePostToCreatePostDto(req),
        method: 'POST',
      }),
    }),
  }),
})

export const { useCreatePostMutation } = createPostMutation
