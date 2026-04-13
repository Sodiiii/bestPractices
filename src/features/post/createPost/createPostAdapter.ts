import type { CreatePost, CreatePostDto } from './createPostModel'

export function transformCreatePostToCreatePostDto(createPost: CreatePost): CreatePostDto {
  return {
    title: createPost.title,
    description: createPost.description,
    author_id: createPost.authorId,
  }
}
