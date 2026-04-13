import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  authorId: z.string().min(1),
})

export type CreatePost = z.infer<typeof createPostSchema>

export type CreatePostDto = {
  title: string
  description: string
  author_id: string
}
