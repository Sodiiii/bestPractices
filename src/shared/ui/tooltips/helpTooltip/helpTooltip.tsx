import type { FC } from 'react'

import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './helpTooltip.module.scss'

interface HelpTooltipProps {
  className?: string
  text: string
  iconType?: 'info' | 'help'
}

export const HelpTooltip: FC<HelpTooltipProps> = ({ className, text, iconType }) => {
  return (
    <Tooltip placement="top" triggers={['hover']}>
      <TooltipTrigger asChild>
        <span>
          {iconType === 'info' ? <InfoCircleOutlined className={cn(cls.helpTooltip, className)} height={15} /> : <QuestionCircleOutlined className={cn(cls.helpTooltip, className)} height={15} />}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
