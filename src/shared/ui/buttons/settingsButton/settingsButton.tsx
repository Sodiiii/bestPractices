import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { IconButton } from '@tinkerbells/xenon-ui'
import { SettingOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'

import cls from './settingsButton.module.scss'

interface SettingsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'primary' | 'error' | 'warning' | 'success'
}

export const SettingsButton: FC<SettingsButtonProps> = ({ className, children, ...rest }) => {
  return (
    <IconButton variant="ghost" className={cn(cls.settingsButton, className)} {...rest}>
      <SettingOutlined />
      {children}
    </IconButton>
  )
}
