import { useCallback } from 'react'

import { useNotification } from '@/shared/ui/notification'
import { useZodHookForm } from '@/shared/lib/react-hook-form'
import { isErrorWithMessage, isFetchBaseQueryError } from '@/shared/api/apiErrors'

import type { CreatePost } from './createPostModel'
import type { CreatePostFormProps } from './createPostForm'

import { createPostSchema } from './createPostModel'
import { useCreatePostMutation } from './createPostMutation'

export function useCreatePostForm(closeModal?: CreatePostFormProps['closeModal']) {
  const notification = useNotification()
  const [createPost, { isLoading }] = useCreatePostMutation()

  const form = useZodHookForm<CreatePost>({
    schema: createPostSchema,
    disabled: isLoading,
    defaultValues: {
      authorId: '1',
    },
  })

  const submit = useCallback(async (data: CreatePost) => {
    try {
      await createPost(data).unwrap()
      notification.success({ message: 'Пост создан' })
      form.reset()
      closeModal()
    }
    catch (err) {
      if (isFetchBaseQueryError(err)) {
        const errMsg = 'error' in err ? err.error : JSON.stringify(err.data)
        notification.error({ message: errMsg })
      }
      else if (isErrorWithMessage(err)) {
        notification.error({ message: err.message })
      }
    }
  }, [createPost, form, notification])

  const handleSubmit = useCallback(() => form.handleSubmit(data => submit(data))(), [form, submit])

  return { form, handleSubmit, isLoading }
}
