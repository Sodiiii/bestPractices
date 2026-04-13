import type { SelectProps } from '@tinkerbells/xenon-ui'
import type { Column, RowData } from '@tanstack/react-table'

import { Select } from '@tinkerbells/xenon-ui'

export interface SelectFilterProps<TData extends RowData = RowData> extends SelectProps {
  column: Column<TData, unknown>
}

export function SelectFilter<TData extends RowData = RowData>({ column, value, options, ...rest }: SelectFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()

  return (
    <Select
      onKeyDown={(event) => {
        event.stopPropagation()
      }}
      style={{ width: '100%' }}
      placeholder="Выберите фильтр"
      allowClear
      value={value || columnFilterValue?.toString()}
      onChange={value => column.setFilterValue(value && String(value))}
      options={options}
      {...rest}
    />
  )
}
