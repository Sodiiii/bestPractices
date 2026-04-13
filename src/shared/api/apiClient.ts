import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

import { baseUrl } from './apiConfig'

export const apiClient = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: () => ({}),
})
