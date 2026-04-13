import type { Post, PostDto } from '@/entities/post/postModel'

export type GetPostsDto = {
  posts: PostDto[]
}
export type GetPosts = {
  posts: Post[]
}
