export interface OkResult<T> {
  ok: true
  data: T
}

export interface ErrResult<E> {
  ok: false
  error: E
}

export type Result<T, E> = OkResult<T> | ErrResult<E>

export function ok<T>(data: T): Result<T, never> {
  return {
    ok: true,
    data,
  }
}

export function err<E>(error: E): Result<never, E> {
  return {
    ok: false,
    error,
  }
}

export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.ok
}

export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E> {
  return !result.ok
}
