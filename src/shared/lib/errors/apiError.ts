import type { ApiErrorTextKey } from './apiErrorTexts'

import { getApiErrorText } from './apiErrorTexts'

interface ApiErrorPayload {
  message?: unknown
  detail?: unknown
}

interface ApiErrorLike {
  name?: unknown
  message?: unknown
  status?: unknown
  response?: {
    status?: unknown
    data?: ApiErrorPayload
  }
  cause?: unknown
}

function asFiniteNumber(value: unknown): number | undefined {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : undefined
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined

  const trimmed = value.trim()
  return trimmed || undefined
}

export class AccessDeniedError extends Error {
  readonly status = 403

  constructor(message = 'Доступ запрещён.', options?: { cause?: unknown }) {
    super(message)
    this.name = 'AccessDeniedError'

    if (options && 'cause' in options) {
      ;(this as Error & { cause?: unknown }).cause = options.cause
    }
  }
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof AccessDeniedError)
    return error.status

  const candidate = error as ApiErrorLike
  const directStatus = asFiniteNumber(candidate?.response?.status) ?? asFiniteNumber(candidate?.status)
  if (directStatus != null)
    return directStatus

  if (candidate?.cause && candidate.cause !== error)
    return getErrorStatus(candidate.cause)

  return undefined
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  const candidate = error as ApiErrorLike

  return asNonEmptyString(candidate?.response?.data?.message)
    ?? asNonEmptyString(candidate?.response?.data?.detail)
    ?? asNonEmptyString(candidate?.message)
    ?? (candidate?.cause && candidate.cause !== error ? extractApiErrorMessage(candidate.cause) : undefined)
}

export function isAccessDeniedError(error: unknown): boolean {
  return getErrorStatus(error) === 403
}

export function resolveApiErrorMessage(
  error: unknown,
  options?: {
    key?: ApiErrorTextKey
    fallbackMessage?: string
    accessDeniedMessage?: string
  },
): string {
  const fallbackMessage = options?.fallbackMessage ?? (options?.key ? getApiErrorText(options.key, 'fallback') : undefined)
  const accessDeniedMessage = options?.accessDeniedMessage ?? (options?.key ? getApiErrorText(options.key, 'accessDenied') : undefined)

  if (isAccessDeniedError(error))
    return accessDeniedMessage ?? extractApiErrorMessage(error) ?? 'Доступ запрещён.'

  return extractApiErrorMessage(error) ?? fallbackMessage ?? 'Произошла ошибка.'
}
