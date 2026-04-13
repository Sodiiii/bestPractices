import type { SelectProps } from '@tinkerbells/xenon-ui'
import type { Column, RowData } from '@tanstack/react-table'

import * as React from 'react'
import { Select } from '@tinkerbells/xenon-ui'

export interface MultiSelectFilterProps<TData extends RowData = RowData> extends SelectProps {
  column: Column<TData, unknown>
}

export function MultiSelectFilter<TData extends RowData = RowData>({ column, value, options, ...rest }: MultiSelectFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()

  const selectedValues = Array.isArray(columnFilterValue) ? columnFilterValue : []

  const handleChange = React.useCallback(
    (value: string[]) => {
      const filterValues = value
      column.setFilterValue(filterValues.length ? filterValues : undefined)
    },
    [column, selectedValues],
  )

  return (
    <Select
      mode="multiple"
      onKeyDown={(event) => {
        event.stopPropagation()
      }}
      style={{ width: '100%' }}
      placeholder="Выберите фильтры"
      allowClear
      value={selectedValues}
      onChange={handleChange}
      options={options}
      {...rest}
    />
  )
}
