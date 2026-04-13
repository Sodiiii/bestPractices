import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

import { cn } from '@/shared/lib/classNames'
import CloseIcon from '@/shared/assets/images/close.svg?react'

import cls from './trashButton.module.scss'

interface trashButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export const TrashButton: FC<trashButtonProps> = ({ className, children, ...rest }) => {
  return (
    <button className={cn(cls.trashButton, className)} {...rest}>
      <CloseIcon />
      {children}
    </button>
  )
}
