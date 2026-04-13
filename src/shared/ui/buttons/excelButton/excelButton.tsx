import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { Button } from '@tinkerbells/xenon-ui'
import { DownloadOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'

import cls from './excelButton.module.scss'

interface ExcelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'primary' | 'error' | 'warning' | 'success'
  loading?: boolean
}

export const ExcelButton: FC<ExcelButtonProps> = ({ className, children, loading = false, ...rest }) => {
  return (
    <Button variant="ghost" loading={loading} className={cn(cls.excelButton, className)} aria-busy={loading} {...rest}>
      <span className={cls.content}>
        <DownloadOutlined />
        {children}
      </span>
    </Button>
  )
}
