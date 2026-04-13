import type { FC, ReactNode } from 'react'

import { cn } from '@/shared/lib/classNames'

import cls from './hiddenControllers.module.scss'

interface hiddenControllersProps {
  className?: string
  children: ReactNode
  controllers: ReactNode[]
  slot?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
}

/** Отображает указанные `controllers` при наведении мыши */
export const HiddenControllers: FC<hiddenControllersProps> = ({
  className,
  children,
  controllers,
  slot = 'topRight',
}) => {
  return (
    <div className={cn(cls.hiddenControllers, className)}>
      <div className={cn(cls.controllers, cls[slot])}>
        {controllers.map((controller, index) => (
          <div key={index} className={cls.controller}>
            {controller}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
