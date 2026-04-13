import type { InputProps } from '@tinkerbells/xenon-ui'
import type { Column, RowData } from '@tanstack/react-table'

import { useEffect, useState } from 'react'
import { Input } from '@tinkerbells/xenon-ui'

export interface SearchFilterProps<TData extends RowData = RowData> extends InputProps {
  column: Column<TData, unknown>
}

export function SearchFilter<TData extends RowData = RowData>({ column, ...rest }: SearchFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()
  const [value, setValue] = useState<string>((columnFilterValue ?? '') as string)

  useEffect(() => {
    setValue((columnFilterValue ?? '') as string)
  }, [columnFilterValue])

  return (
    <Input.Search
      onKeyDown={(event) => {
        event.stopPropagation()
      }}
      value={value}
      onChange={e => setValue(e.target.value)}
      onSearch={value => column.setFilterValue(value)}
      placeholder="Поиск..."
      {...rest}
    />
  )
}
