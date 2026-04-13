import { Card, Flex } from '@tinkerbells/xenon-ui'

import { CreatePost } from '@/features/post/createPost/createPostButton'

import cls from './postPage.module.scss'
import { PostsTable } from './ui/postsTable'

export default function PostPage() {
  return (
    <Flex align="center" justify="center" className={cls.postPage}>
      <Card title="Пример таблицы" size="small" className={cls.card} extra={<CreatePost />}>
        <PostsTable />
      </Card>
    </Flex>
  )
}
