import { http, HttpResponse } from 'msw'
import { fakerRU as faker } from '@faker-js/faker'

import type { PostDto } from '@/entities/post/postModel'
import type { GetPostsDto } from '@/features/post/getPosts/getPostsModel'

export const handlers = [
  http.get('/api/getPosts', () => {
    const posts: PostDto[] = Array.from({ length: faker.number.int({ min: 20, max: 100 }) }, () => ({
      id: faker.string.uuid(),
      title: faker.helpers.arrayElement([
        'Внедрение новых технологий в производство',
        'Анализ рынка энергоресурсов',
        'Оптимизация логистических процессов',
        'Развитие IT-инфраструктуры компании',
        'Модернизация оборудования',
        'Цифровизация бизнес-процессов',
        'Экологическая политика предприятия',
        'Система управления качеством',
        'Стратегическое планирование',
        'Управление персоналом',
        'Финансовый анализ и бюджетирование',
        'Безопасность труда на производстве',
        'Инновационные решения в энергетике',
        'Автоматизация производственных процессов',
        'Корпоративные коммуникации',
      ]),
      description: faker.lorem.paragraph(),
      created_at: faker.date.anytime().toISOString(),
      status: faker.helpers.arrayElement([0, 1, 2]),
      author: {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        middle_name: faker.person.middleName(),
      },
    }))

    const response: GetPostsDto = {
      posts,
    }

    return HttpResponse.json(response)
  }),
]
