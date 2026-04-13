import type { Column } from '@tanstack/react-table'

import * as React from 'react'
import { DropdownItem, Flex, Radio } from '@tinkerbells/xenon-ui'

type SortingProps = {
  column: Column<any>
}

export function DataTableSorting({ column }: SortingProps) {
  const handleSortingChange = React.useCallback((value: 'asc' | 'desc' | 'default') => {
    if (value === 'default') {
      column.clearSorting()
    }
    else {
      column.toggleSorting(value === 'desc', false)
    }
  }, [column.getIsSorted()])

  return (
    <Flex vertical gap="small">
      <DropdownItem>
        <Radio
          checked={!column.getIsSorted()}
          onClick={e => e.preventDefault()}
          onChange={() => handleSortingChange('default')}
        >
          Сортировка по умолчанию
        </Radio>
      </DropdownItem>
      <DropdownItem>
        <Radio
          checked={column.getIsSorted() === 'asc'}
          onClick={e => e.preventDefault()}
          onChange={() => handleSortingChange('asc')}
        >
          По возрастанию
        </Radio>
      </DropdownItem>
      <DropdownItem>
        <Radio
          checked={column.getIsSorted() === 'desc'}
          onChange={() => handleSortingChange('desc')}
        >
          По убыванию
        </Radio>
      </DropdownItem>
    </Flex>
  )
}
