import type { Column } from '@tanstack/react-table'
import type { InputProps, RangePickerProps, SelectProps } from '@tinkerbells/xenon-ui'

import type { DataTableFilterField } from '../../dataTableTypes'

import { DateFilter } from './dateFilter'
import { SearchFilter } from './searchFilter'
import { SelectFilter } from './selectFilter'
import { MultiSelectFilter } from './multiSelectFilter'

export type FilterProps = {
  filter: DataTableFilterField
  column: Column<any>
  props?: RangePickerProps | InputProps | SelectProps
}

export function DataTableFilter({ filter, column, props }: FilterProps) {
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
