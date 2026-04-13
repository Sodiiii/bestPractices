import type { UseQueryStateOptions } from 'nuqs'
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableOptions,
  TableState,
  Updater,
  VisibilityState,
} from '@tanstack/react-table'

import * as React from 'react'
import {
  parseAsInteger,
  useQueryState,
} from 'nuqs'
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ExtendedColumnFilter, ExtendedColumnSort } from './dataTableTypes'

import { getFiltersStateParser, getSortingStateParser } from './dataTableTypes'

const PAGE_KEY = 'page'
const PER_PAGE_KEY = 'perPage'
const SORT_KEY = 'sort'
const FILTERS_KEY = 'filters'
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    | 'state'
    | 'pageCount'
    | 'getCoreRowModel'
    | 'manualFiltering'
    | 'manualPagination'
    | 'manualSorting'
  >,
  Required<Pick<TableOptions<TData>, 'pageCount'>> {
  initialState?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  history?: 'push' | 'replace'
  debounceMs?: number
  throttleMs?: number
  clearOnDefault?: boolean
  scroll?: boolean
  shallow?: boolean
  startTransition?: React.TransitionStartFunction
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    history = 'replace',
    clearOnDefault = false,
    scroll = false,
    shallow = true,
    throttleMs = THROTTLE_MS,
    startTransition,
    ...tableProps
  } = props

  const queryStateOptions = React.useMemo<
    Omit<UseQueryStateOptions<string>, 'parse'>
  >(
    () => ({
      history,
      scroll,
      shallow,
      throttleMs,
      clearOnDefault,
      startTransition,
    }),
    [
      history,
      scroll,
      shallow,
      throttleMs,
      clearOnDefault,
      startTransition,
    ],
  )

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  )

  const [columnVisibility, setColumnVisibility]
    = React.useState<VisibilityState>(initialState?.columnVisibility ?? {})

  const [page, setPage] = useQueryState(
    PAGE_KEY,
    parseAsInteger.withOptions(queryStateOptions).withDefault(1),
  )
  const [perPage, setPerPage] = useQueryState(
    PER_PAGE_KEY,
    parseAsInteger
      .withOptions(queryStateOptions)
      .withDefault(initialState?.pagination?.pageSize ?? 10),
  )

  const pagination: PaginationState = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage,
    }
  }, [page, perPage])

  const onPaginationChange = React.useCallback((updaterOrValue: Updater<PaginationState>) => {
    if (typeof updaterOrValue === 'function') {
      const newPagination = updaterOrValue(pagination)
      void setPage(newPagination.pageIndex)
      void setPerPage(newPagination.pageSize)
    }
    else {
      void setPage(updaterOrValue.pageIndex)
      void setPerPage(updaterOrValue.pageSize)
    }
  }, [pagination, setPage, setPerPage])

  const columnIds = React.useMemo(() => {
    return new Set(
      columns.map(column => column.id).filter(Boolean) as string[],
    )
  }, [columns])

  const [sorting, setSorting] = useQueryState(
    SORT_KEY,
    getSortingStateParser<TData>(columnIds)
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? []),
  )

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      if (typeof updaterOrValue === 'function') {
        const newSorting = updaterOrValue(sorting)
        setSorting(newSorting as ExtendedColumnSort<TData>[])
      }
      else {
        setSorting(updaterOrValue as ExtendedColumnSort<TData>[])
      }
    },
    [sorting, setSorting],
  )

  const [columnFilters, setColumnFilters] = useQueryState(
    FILTERS_KEY,
    getFiltersStateParser<TData>(columns.map(field => field.id))
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
        throttleMs,
      }),
  )

  const onColumnFiltersChange = React.useCallback((updaterOrValue: Updater<ColumnFiltersState>) => {
    if (typeof updaterOrValue === 'function') {
      const newFilters = updaterOrValue(columnFilters)
      setColumnFilters(newFilters as ExtendedColumnFilter<TData>[])
    }
    else {
      setColumnFilters(updaterOrValue as ExtendedColumnFilter<TData>[])
    }
  }, [columnFilters, setColumnFilters])

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return { table, shallow, throttleMs }
}
