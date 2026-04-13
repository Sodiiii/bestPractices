import '@tanstack/react-table'
import type { SelectProps } from '@tinkerbells/xenon-ui'
import type { ColumnFilter, ColumnSort } from '@tanstack/react-table'

import { z } from 'zod'
import { createParser } from 'nuqs'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  type ColumnMeta<TData = unknown, TValue = unknown> = {
    align?: 'center' | 'left' | 'right'
  }
}

export type ExtendedColumnSort<TData> = {
  id: Extract<keyof TData, string>
} & Omit<ColumnSort, 'id'>

export type ExtendedColumnFilter<TData> = {
  id: Extract<keyof TData, string>
} & Omit<ColumnFilter, 'id'>

export const filterTypes = [
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'multi-select',
] as const

export type ColumnType = typeof filterTypes[number]

type BaseDataTableFilterField = {
  type: ColumnType
}

type SelectDataTableFilterField = {
  type: 'select' | 'multi-select'
  options: SelectProps['options']
  value?: SelectProps['value']
} & BaseDataTableFilterField

type OtherDataTableFilterField = {
  type: Exclude<ColumnType, 'select' | 'multi-select'>
  options?: never
  value?: any
} & BaseDataTableFilterField

export type DataTableFilterField = SelectDataTableFilterField | OtherDataTableFilterField

/**
 * Схема валидации фильтров
 */
export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
})

export type FilterSchema = z.infer<typeof filterSchema>

export function getFiltersStateParser<TData>(columnIds?: string[] | Set<string>) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(filterSchema).safeParse(parsed)

        if (!result.success)
          return null

        if (validKeys && result.data.some(item => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnFilter<TData>[]
      }
      catch {
        return null
      }
    },
    serialize: value => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length
      && a.every(
        (filter, index) =>
          filter.id === b[index]?.id
          && filter.value === b[index]?.value,
      ),
  })
}

/**
 * Схема валидации сортировки
 */
export const sortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

export function getSortingStateParser<TData>(columnIds?: string[] | Set<string>) {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null

  return createParser({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(sortingSchema).safeParse(parsed)

        if (!result.success)
          return null

        if (validKeys && result.data.some(item => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedColumnSort<TData>[]
      }
      catch {
        return null
      }
    },
    serialize: value => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length
      && a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  })
}

export type DataTableQueryParams = {
  page: number
  perPage: number
  filters: z.infer<typeof filterSchema>[]
  sort: z.infer<typeof sortingSchema>[]
}
