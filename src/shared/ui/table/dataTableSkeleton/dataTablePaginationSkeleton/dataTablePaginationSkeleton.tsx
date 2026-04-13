import { Flex, Skeleton } from '@tinkerbells/xenon-ui'

import cls from './dataTablePaginationSkeleton.module.scss'

export function DataTablePaginationSkeleton() {
  return (
    <Flex className={cls.dataTablePaginationSkeleton} gap="middle">
      <Skeleton title={false} paragraph={{ rows: 1, width: 100 }} />
      <Skeleton title={false} paragraph={{ rows: 1, width: 350 }} />
      <Skeleton title={false} paragraph={{ rows: 1, width: 50 }} />
    </Flex>
  )
}
