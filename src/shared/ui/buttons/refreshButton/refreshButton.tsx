import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { ClearOutlined } from '@ant-design/icons'
import { IconButton } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './refreshButton.module.scss'

interface refreshButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'primary' | 'error' | 'warning' | 'success'

}

export const RefreshButton: FC<refreshButtonProps> = ({ className, children, ...rest }) => {
  return (
    <IconButton variant="ghost" className={cn(cls.refreshButton, className)} {...rest}>
      <ClearOutlined style={{ color: 'var(--red)' }} />
      {children}
    </IconButton>
  )
}
