import type { Dayjs } from 'dayjs'
import type { Column, RowData } from '@tanstack/react-table'
import type { RangePickerProps } from '@tinkerbells/xenon-ui'

import { z } from 'zod'
import dayjs from 'dayjs'
import { DatePicker } from '@tinkerbells/xenon-ui'

import { DateFormat, dateFormatter } from '@/shared/lib/dateFormatter'

const dateRangeSchema = z.array(z.string().min(2))

export interface DateFilterProps<TData extends RowData = RowData> extends RangePickerProps {
  column: Column<TData, unknown>
}

export function DateFilter<TData extends RowData = RowData>({ column, ...rest }: DateFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()

  const parseDefaultDates = (): [Dayjs, Dayjs] | undefined => {
    if (!columnFilterValue || !Array.isArray(columnFilterValue) || columnFilterValue.length !== 2) {
      return undefined
    }

    try {
      const parsedDates = columnFilterValue.map((dateStr) => {
        const dateObj = dateFormatter.parse(dateStr, 'YYYY-MM-DD')
        return dateObj ? dayjs(dateObj) : null
      })

      if (parsedDates[0] && parsedDates[1]) {
        return [parsedDates[0], parsedDates[1]]
      }

      return undefined
    }
    catch (error) {
      console.error('Error parsing date values:', error)
      return undefined
    }
  }

  const handleChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
    const validationResult = dateRangeSchema.safeParse(dateStrings)
    if (validationResult.success && dates) {
      const isoDateStrings = dates.map(date =>
        date ? dateFormatter.format(date.toDate(), DateFormat.ISO) : '',
      )

      column.setFilterValue(isoDateStrings)
    }
    else {
      column.setFilterValue(null)
    }
  }

  return (
    <DatePicker.RangePicker
      onChange={handleChange}
      defaultValue={parseDefaultDates()}
      value={parseDefaultDates()}
      // для предотвращения закрытия Popover по клику
      getPopupContainer={(trigger: HTMLElement) => trigger.parentElement ?? trigger}
      {...rest}
    />
  )
}
