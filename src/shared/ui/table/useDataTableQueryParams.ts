import { parseAsInteger, useQueryStates } from 'nuqs'

import type { DataTableQueryParams } from './dataTableTypes'

import { getFiltersStateParser, getSortingStateParser } from './dataTableTypes'

export function useDataTableQueryParams<TData>(defaultValues?: Partial<DataTableQueryParams>): { params: DataTableQueryParams } {
  const [queryParams] = useQueryStates({
    page: parseAsInteger.withDefault(defaultValues?.page ?? 1),
    perPage: parseAsInteger.withDefault(defaultValues?.perPage ?? 100),
    filters: getFiltersStateParser<TData>(),
    sort: getSortingStateParser<TData>(),
  })
  return { params: queryParams as DataTableQueryParams }
}
