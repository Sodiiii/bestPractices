import { http, HttpResponse } from 'msw'
import { fakerRU as faker } from '@faker-js/faker'

import type { PostDto } from '@/entities/post/postModel'

import type { CreatePostDto } from '../createPostModel'

export const handlers = [
  http.post('/api/createPost', async ({ request }) => {
    const body = await request.json() as CreatePostDto

    const newPost: PostDto = {
      id: faker.string.uuid(),
      title: body.title,
      description: body.description,
      created_at: new Date().toISOString(),
      status: 0,
      author: {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        middle_name: faker.person.middleName(),
      },
    }

    return HttpResponse.json(newPost)
  }),
]
