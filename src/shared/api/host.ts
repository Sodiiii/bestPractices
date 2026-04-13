import type { InternalAxiosRequestConfig } from 'axios'

import axios from 'axios'

import { env } from '../lib/env'
import { AccessDeniedError, extractApiErrorMessage } from '../lib/errors/apiError'

const $api = axios.create({
  baseURL: env.BACKEND_URL,
})

// Helper function to process global_filters parameters
function withGlobalFilters(params: Record<string, unknown>) {
  const result: Record<string, unknown> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'global_filters' && typeof value === 'object' && value !== null) {
      // Special handling for global_filters: add each nested key as its own query param
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        const paramKey = 'global_filters' // Always use 'global_filters' key
        const current = Array.isArray(result[paramKey]) ? result[paramKey] as string[] : []
        current.push(`${nestedKey}=${nestedValue}`)
        result[paramKey] = current
      })
    }
    else {
      // Normal parameters are added as is
      result[key] = value
    }
  })

  return result
}

type InterceptorType = (
  (config: InternalAxiosRequestConfig<unknown>) => InternalAxiosRequestConfig<unknown> | Promise<InternalAxiosRequestConfig<unknown>>
) | null | undefined

const requestInterceptor: InterceptorType = (config) => {
  if (config.method === 'get' && config.params) {
    const flattenedParams = withGlobalFilters(config.params as Record<string, unknown>)

    // Format the query string for global_filters
    const queryString = Object.entries(flattenedParams)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          // Join multiple global_filters
          return value.map(v => `${key}=${v}`).join('&')
        }
        return `${key}=${value}`
      })
      .join('&')

    config.params = {} // To avoid params duplication

    if (config.url?.includes('?'))
      config.url += `&${queryString}`
    else
      config.url += `?${queryString}`
  }

  return config
}

// Interceptor to adjust params for GET requests
$api.interceptors.request.use(requestInterceptor, (error: unknown) => Promise.reject(error))
$api.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return Promise.reject(
        new AccessDeniedError(
          extractApiErrorMessage(error) ?? 'Доступ запрещён.',
          { cause: error },
        ),
      )
    }

    return Promise.reject(error)
  },
)

export { $api }
