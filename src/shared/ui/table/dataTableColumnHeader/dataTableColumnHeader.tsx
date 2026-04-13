import type { Column, RowData } from '@tanstack/react-table'
import type { InputProps, RangePickerProps, SelectProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { FilterFilled } from '@ant-design/icons'
import { Button, Dropdown, DropdownContent, DropdownDivider, DropdownItem, DropdownTrigger } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'
import { useIsMounted } from '@/shared/lib/hooks/useIsMounted'

import type { DataTableFilterField } from '../dataTableTypes'

import { DataTableFilter } from './dataTableFilter'
import { DataTableSorting } from './dataTableSorting'
import cls from './dataTableColumnHeader.module.scss'

interface DataTableColumnHeaderProps<TData extends RowData> extends React.ComponentProps<'div'> {
  column: Column<TData>
  filter: DataTableFilterField
  filterProps?: RangePickerProps | InputProps | SelectProps
}

export function DataTableColumnHeader<TData extends RowData>({ column, filter, children, filterProps }: DataTableColumnHeaderProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const columnFilterValue = column.getFilterValue()

  const isMounted = useIsMounted()

  React.useEffect(() => {
    isMounted() && setOpen(false)
  }, [columnFilterValue])

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <div className={cls.dataTableColumnHeader}>
        <DropdownTrigger asChild>
          <Button className={cls['dataTableColumnHeader--trigger']} data-status={open ? 'open' : 'closed'} variant="ghost">
            {children}
            <span className={cn(cls['dataTableColumnHeader--trigger-icon'], (columnFilterValue !== undefined || !!column.getIsSorted()) && cls['dataTableColumnHeader--trigger-icon_active'])}>
              <FilterFilled />
            </span>
          </Button>
        </DropdownTrigger>
      </div>
      <DropdownContent className={cls['dataTableColumnHeader--content']}>
        <DataTableSorting<TData> column={column} />
        <DropdownDivider horizontalMargin={10} />
        <DataTableFilter<TData> filter={filter} column={column} props={filterProps} />
        <DropdownDivider horizontalMargin={10} />
        <DropdownItem
          className={cls.reset}
          onClick={() => {
            column.setFilterValue(null)
            column.clearSorting()
          }}
        >
          Сбросить
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
