import { Skeleton, TableHead, TableHeader, TableRow } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './dataTableHeaderSkeleton.module.scss'

type DataTableHeaderSkeletonProps = {
  columns: number
  widths?: (string | number)[]
}

export function DataTableHeaderSkeleton({ columns, widths = [] }: DataTableHeaderSkeletonProps) {
  return (
    <TableHeader className={cn(cls.dataTableHeaderSkeleton)}>
      <TableRow>
        {Array.from({ length: columns }).map((_, index) => {
          const width = widths[index] || 'auto' // Use provided width or default to 'auto'

          return (
            <TableHead
              key={`header-skeleton-${index}`}
              style={{ width }}
            >
              <Skeleton
                className={cn(cls.skeleton)}
                title={false}
                paragraph={{
                  rows: 1,
                }}
              />
            </TableHead>
          )
        })}
      </TableRow>
    </TableHeader>
  )
}
