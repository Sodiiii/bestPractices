import { Navigate } from 'react-router'
import { Alert, Button, Typography } from '@tinkerbells/xenon-ui'

import { env } from '@/shared/lib/env'

import cls from './errorHandler.module.scss'

interface ErrorHandlerProps {
  error: Error
  resetErrorBoundary?: (...args: unknown[]) => void
}

const isDevelopment = env.NODE_ENV === 'development'

interface ErrorWithResponseStatus {
  response?: {
    status?: number
  }
}

function hasErrorStatus(error: unknown, status: number): boolean {
  if (!error || typeof error !== 'object')
    return false

  const typedError = error as ErrorWithResponseStatus
  return typedError.response?.status === status
}

export function ErrorHandler(props: ErrorHandlerProps) {
  const { error, resetErrorBoundary } = props

  if (hasErrorStatus(error, 404)) {
    return <Navigate to="/404" replace />
  }
  const errorMessage = isDevelopment
    ? error.message
    : 'Произошла ошибка'

  const errorDescription = isDevelopment
    ? error.stack
    : 'Возникла ошибка в приложении. Пожалуйста, попробуйте обновить страницу или обратитесь в поддержку, если проблема повторится.'

  return (
    <Alert
      className={cls.errorMessage}
      type="error"
      message={errorMessage}
      description={
        <pre><Typography>{errorDescription}</Typography></pre>
      }
      action={(
        <Button size="sm" color="error" onClick={resetErrorBoundary}>
          Обновить
        </Button>
      )}
    />
  )
}
