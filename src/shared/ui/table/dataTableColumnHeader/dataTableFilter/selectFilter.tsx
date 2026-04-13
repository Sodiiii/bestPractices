import type { Column } from '@tanstack/react-table'
import type { SelectProps } from '@tinkerbells/xenon-ui'

import { Select } from '@tinkerbells/xenon-ui'

export type SelectFilterProps = {
  column: Column<any>
} & SelectProps

export function SelectFilter({ column, value, options, ...rest }: SelectFilterProps) {
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
