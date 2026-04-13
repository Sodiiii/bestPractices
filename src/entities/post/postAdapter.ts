import type { TagProps } from '@tinkerbells/xenon-ui'

import type { Post } from './postModel'

import { PostStatus } from './postModel'

export class PostAdapter {
  static getAuthorFullName(author: Post['author']) {
    return `${author.lastName} ${author.firstName[0]}.${author.middleName[0]}.`
  }

  static getStatusText(status: Post['status']) {
    const statusLabels = {
      [PostStatus.REVIEWING]: 'В обработке',
      [PostStatus.PUBLISHED]: 'Опубликован',
      [PostStatus.DELETED]: 'Удален',
    }
    return statusLabels[status]
  }

  static getStatusColor(status: Post['status']): TagProps['color'] {
    const statusLabels = {
      [PostStatus.REVIEWING]: 'processing',
      [PostStatus.PUBLISHED]: 'success',
      [PostStatus.DELETED]: 'error',
    }
    return statusLabels[status]
  }
}
