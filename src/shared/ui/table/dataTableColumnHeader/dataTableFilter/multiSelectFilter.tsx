import type { Column } from '@tanstack/react-table'
import type { SelectProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { Select } from '@tinkerbells/xenon-ui'

export type MultiSelectFilterProps = {
  column: Column<any>
} & SelectProps

export function MultiSelectFilter({ column, value, options, ...rest }: MultiSelectFilterProps) {
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
