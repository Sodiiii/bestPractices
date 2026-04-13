import type { SelectProps } from '@tinkerbells/xenon-ui'
import type { ColumnFilter, ColumnSort } from '@tanstack/react-table'

import { z } from 'zod'
import { createParser } from 'nuqs'

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>
}

export interface ExtendedColumnFilter<TData> extends Omit<ColumnFilter, 'id'> {
  id: Extract<keyof TData, string>
}

export const filterTypes = [
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'multi-select',
] as const

export type ColumnType = typeof filterTypes[number]

interface BaseDataTableFilterField {
  type: ColumnType
}

interface SelectDataTableFilterField extends BaseDataTableFilterField {
  type: 'select' | 'multi-select'
  options: SelectProps['options']
  value?: SelectProps['value']
}

interface OtherDataTableFilterField extends BaseDataTableFilterField {
  type: Exclude<ColumnType, 'select' | 'multi-select'>
  options?: never
  value?: unknown
}

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

export interface DataTableQueryParams {
  page: number
  perPage: number
  filters: z.infer<typeof filterSchema>[]
  sort: z.infer<typeof sortingSchema>[]
}
