import type { Cell } from '@tanstack/react-table'

import * as React from 'react'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableTruncatedCell.module.scss'

type DataTableTruncatedCellProps = {
  cell: Cell<any, string | undefined>
  width?: string | number
  maxWidth?: string | number
  height?: string | number
  maxLines?: number
  className?: string
}

export const DataTableTruncatedCell = React.memo(
  ({ cell, width, maxWidth, height, maxLines = 4, className }: DataTableTruncatedCellProps) => {
    const cellValue = React.useMemo(() => cell.getValue(), [cell.getValue()])

    const style = React.useMemo(() => ({
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(maxWidth && { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
      ...(maxLines > 1 && { WebkitLineClamp: maxLines }),
    }), [width, maxWidth, height, maxLines])

    return (
      <div
        title={cellValue}
        className={cn(cls.truncatedCell, className)}
        style={style}
      >
        {cellValue}
      </div>
    )
  },
)
