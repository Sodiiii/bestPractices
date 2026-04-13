import type { FC } from 'react'

import { CalendarOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'
import SummIcon from '@/shared/assets/images/summ.svg?react'
import HierarchicalIcon from '@/shared/assets/images/hierarhical.svg?react'

import cls from './attributeIcon.module.scss'

interface AttributeIconProps {
  className?: string
  attributeType?: 'fact' | 'dict' | 'calendar_attribute_sep' | 'system' | 'UID' | 'calendar_dict' | 'hierarchical_dict'
}

export const AttributeIcon: FC<AttributeIconProps> = ({ className, attributeType }) => {
  if (attributeType === 'fact') {
    return (
      <div className={cn(cls.attributeIcon, className)}>
        <SummIcon />
      </div>
    )
  }

  if (attributeType === 'hierarchical_dict') {
    return (
      <div className={cn(cls.attributeIcon, className)}>
        <HierarchicalIcon />
      </div>
    )
  }

  if (attributeType === 'calendar_dict') {
    return (
      <div className={cn(cls.attributeIcon, className)}>
        <CalendarOutlined />
      </div>
    )
  }

  return null
}
