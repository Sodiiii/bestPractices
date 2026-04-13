import type { Column } from '@tanstack/react-table'
import type { InputProps } from '@tinkerbells/xenon-ui'

import { useEffect, useState } from 'react'
import { Input } from '@tinkerbells/xenon-ui'

export type SearchFilterProps = {
  column: Column<any>
} & InputProps

export function SearchFilter({ column, ...rest }: SearchFilterProps) {
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
