import { lazy } from 'react'
import { Button } from '@tinkerbells/xenon-ui'
import { PlusOutlined } from '@ant-design/icons'

import { useModal } from '@/shared/ui/modal'

const CreatePostForm = lazy(() => import('./createPostForm').then(module => ({ default: module.CreatePostForm })))

export function CreatePost() {
  const modal = useModal()
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={modal.open}
      >
        <PlusOutlined />
        Создать пост
      </Button>
      <CreatePostForm open={modal.isOpen} onCancel={modal.close} closeModal={modal.close} />
    </>
  )
}
