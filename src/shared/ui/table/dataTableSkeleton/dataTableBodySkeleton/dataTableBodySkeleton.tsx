import { Skeleton, TableBody, TableCell, TableRow } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableBodySkeleton.module.scss'

type DataTableBodySkeletonProps = {
  columns: number
  rowCount?: number
}

export function DataTableBodySkeleton({ columns, rowCount = 20 }: DataTableBodySkeletonProps) {
  return (
    <TableBody className={cn(cls.dataTableBodySkeleton)}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`row-skeleton-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`cell-skeleton-${rowIndex}-${colIndex}`}>
              <Skeleton
                paragraph={{
                  rows: 1,
                  width: '80%',
                }}
                title={false}
                className={cn(cls.item)}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
