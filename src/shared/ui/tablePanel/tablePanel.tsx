import type { FC, ReactNode } from 'react'

import { Typography } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './tablePanel.module.scss'

interface TablePanelProps {
  name: string
  className: string
  children?: ReactNode
}

export const TablePanel: FC<TablePanelProps> = ({
  name,
  className,
  children,
}) => {
  return (
    <div className={cn(cls.tablePanel, className)}>
      <div className={cls.tablePanel__header}>
        <Typography textStyle="strong" level="heading5">
          {name}
        </Typography>
      </div>
      <div className={cls.tablePanel__content}>{children}</div>
    </div>
  )
}
