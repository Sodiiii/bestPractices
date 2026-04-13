import type { ModalProps } from '@tinkerbells/xenon-ui'

import { withErrorBoundary } from 'react-error-boundary'
import { Form, Input, Modal, Spin } from '@tinkerbells/xenon-ui'

import { FormItem } from '@/shared/ui/form'
import { compose } from '@/shared/lib/react/hocs/compose'
import { logError } from '@/shared/ui/errorHandler/logError'
import { withSuspense } from '@/shared/lib/react/hocs/withSuspense'
import { ErrorHandler } from '@/shared/ui/errorHandler/errorHandler'

import { useCreatePostForm } from './useCreatePostForm'

export type CreatePostFormProps = ModalProps & { closeModal: () => void }

const enhance = compose<CreatePostFormProps>(
  component =>
    withErrorBoundary(component, {
      FallbackComponent: ErrorHandler,
      onError: logError,
    }),
  component =>
    withSuspense(component, { FallbackComponent: Spin }),
)

export const CreatePostForm = enhance((props: CreatePostFormProps) => {
  const { form, handleSubmit } = useCreatePostForm(props.closeModal)

  return (
    <Modal
      width={400}
      title="Создание поста"
      onOk={handleSubmit}
      centered
      destroyOnHidden
      {...props}
    >
      <Form layout="vertical">
        <FormItem required control={form.control} name="title" label="Заголовок">
          <Input />
        </FormItem>
        <FormItem required control={form.control} name="description" label="Описание">
          <Input />
        </FormItem>
      </Form>
    </Modal>
  )
})
