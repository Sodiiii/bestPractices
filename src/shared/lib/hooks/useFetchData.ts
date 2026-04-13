import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { registerRefetch, unregisterRefetch } from './refetchRegistry'
import { isAccessDeniedError, resolveApiErrorMessage } from '../errors/apiError'

export type FetchErrorType = 'accessDenied' | 'generic'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  errorType: FetchErrorType | null
}

interface CacheEntry<T> {
  data: T
  ts: number
}

const cacheStore = new Map<string, CacheEntry<unknown>>()

function readCache<T>(key: string): CacheEntry<T> | null {
  return (cacheStore.get(key) as CacheEntry<T> | undefined) ?? null
}

function getCachedData<T>(key: string, ttlMs?: number): T | null {
  const entry = readCache<T>(key)
  if (!entry)
    return null
  if (ttlMs != null && Date.now() - entry.ts > ttlMs)
    return null
  return entry.data
}

function setCachedData<T>(key: string, data: T) {
  cacheStore.set(key, { data, ts: Date.now() })
}

function isAbortError(error: unknown) {
  const e = error as { name?: unknown, code?: unknown } | null
  return e?.name === 'AbortError'
    || e?.name === 'CanceledError'
    || e?.code === 'ERR_CANCELED'
}

export function useFetchData<T>(
  fetchFunction: (signal?: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
  conditions: boolean[] = [],
  options?: {
    refetchKey?: string | string[]
    cacheKey?: string
    cacheTtlMs?: number
    skipFetchIfCached?: boolean
  },
) {
  const cacheKey = options?.cacheKey
  const cacheTtlMs = options?.cacheTtlMs
  const initialCached = cacheKey ? getCachedData<T>(cacheKey, cacheTtlMs) : null

  const fetchFunctionRef = useRef(fetchFunction)
  const abortRef = useRef<AbortController | null>(null)
  const requestSeqRef = useRef(0)

  const [state, setState] = useState<FetchState<T>>({
    data: initialCached,
    loading: false,
    error: null,
    errorType: null,
  })

  const canFetch = conditions.length === 0 || conditions.every(Boolean)

  const armed = canFetch && state.data == null && state.error == null && state.loading === false
  const uiLoading = state.loading || armed

  useEffect(() => {
    fetchFunctionRef.current = fetchFunction
  }, [fetchFunction])

  const fetchData = useCallback(async (opts?: { force?: boolean }) => {
    abortRef.current?.abort()
    abortRef.current = null

    if (!canFetch)
      return

    if (!opts?.force && options?.skipFetchIfCached && cacheKey) {
      const cached = getCachedData<T>(cacheKey, cacheTtlMs)
      if (cached != null) {
        setState(prev => (prev.data == null
          ? {
              data: cached,
              loading: false,
              error: null,
              errorType: null,
            }
          : prev))
        return
      }
    }

    const controller = new AbortController()
    abortRef.current = controller
    const requestSeq = ++requestSeqRef.current

    setState(prev => ({ ...prev, loading: true, error: null, errorType: null }))

    try {
      const data = await fetchFunctionRef.current(controller.signal)
      if (requestSeq !== requestSeqRef.current)
        return

      setState({ data, loading: false, error: null, errorType: null })
      if (cacheKey)
        setCachedData(cacheKey, data)
    }
    catch (error: unknown) {
      if (requestSeq !== requestSeqRef.current)
        return
      if (isAbortError(error)) {
        setState(prev => (prev.loading ? { ...prev, loading: false } : prev))
        return
      }

      const errorMessage = resolveApiErrorMessage(error, { key: 'common.fetch' })
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        errorType: isAccessDeniedError(error) ? 'accessDenied' : 'generic',
      })
    }
    finally {
      if (abortRef.current === controller)
        abortRef.current = null
    }
  }, [...deps, canFetch, cacheKey, cacheTtlMs, options?.skipFetchIfCached])

  const refetchKeys = useMemo(() => options?.refetchKey, [options?.refetchKey])
  const refetch = useCallback(() => fetchData({ force: true }), [fetchData])

  useEffect(() => {
    if (!refetchKeys)
      return
    registerRefetch(refetchKeys, refetch)
    return () => unregisterRefetch(refetchKeys, refetch)
  }, [refetchKeys, refetch])

  useEffect(() => {
    if (!cacheKey)
      return
    const cached = getCachedData<T>(cacheKey, cacheTtlMs)
    if (cached != null) {
      setState({ data: cached, loading: false, error: null, errorType: null })
    }
    else {
      setState(prev => (prev.data != null || prev.error != null || prev.errorType != null
        ? {
            ...prev,
            data: null,
            error: null,
            errorType: null,
          }
        : prev))
    }
  }, [cacheKey, cacheTtlMs])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (canFetch)
      return
    abortRef.current?.abort()
    abortRef.current = null
    setState(prev => (prev.loading ? { ...prev, loading: false } : prev))
  }, [canFetch])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [])

  return {
    ...state,
    loading: uiLoading,
    canFetch,
    refetch,
  }
}
