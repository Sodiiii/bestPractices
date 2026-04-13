import type { Column, RowData } from '@tanstack/react-table'
import type { InputProps, RangePickerProps, SelectProps } from '@tinkerbells/xenon-ui'

import type { DataTableFilterField } from '../../dataTableTypes'

import { DateFilter } from './dateFilter'
import { SearchFilter } from './searchFilter'
import { SelectFilter } from './selectFilter'
import { MultiSelectFilter } from './multiSelectFilter'

export interface FilterProps<TData extends RowData = RowData> {
  filter: DataTableFilterField
  column: Column<TData, unknown>
  props?: RangePickerProps | InputProps | SelectProps
}

export function DataTableFilter<TData extends RowData = RowData>({ filter, column, props }: FilterProps<TData>) {
  switch (filter.type) {
    case 'number':
    case 'text':
      return (
        <SearchFilter column={column} type={filter.type} {...props as InputProps} />
      )
    case 'select':
      return (
        <SelectFilter column={column} options={filter.options} value={filter.value} {...props as SelectProps} />
      )
    case 'multi-select':
      return (
        <MultiSelectFilter column={column} options={filter.options} value={filter.value} {...props as SelectProps} />
      )
    case 'date':
      return (
        <DateFilter column={column} {...props as RangePickerProps} />
      )
    default:
      return null
  }
}
