import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { Button } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './sqlButton.module.scss'

interface SqlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'primary' | 'error' | 'warning' | 'success'
}

export const SqlButton: FC<SqlButtonProps> = ({ className, children, ...rest }) => {
  return (
    <Button variant="ghost" className={cn(cls.sqlButton, className)} {...rest}>
      SQL
      {children}
    </Button>
  )
}
