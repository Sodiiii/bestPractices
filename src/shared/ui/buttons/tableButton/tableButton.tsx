import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { TableOutlined } from '@ant-design/icons'
import { IconButton } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './tableButton.module.scss'

interface TableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'primary' | 'error' | 'warning' | 'success'
}

export const TableButton: FC<TableButtonProps> = ({ className, children, ...rest }) => {
  return (
    <IconButton variant="ghost" className={cn(cls.settingsButton, className)} {...rest}>
      <TableOutlined />
      {children}
    </IconButton>
  )
}
