import type { CSSProperties, FC, ReactNode } from 'react'

import { Empty, Spin, Typography } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from './card.module.scss'

interface ChartCardProps {
  title: string
  subtitle?: string
  date?: string
  children: ReactNode | null
  className?: string
  /** Inline-стили корневой карточки. */
  style?: CSSProperties
  headerClass?: string
  headerTitleClass?: string
  /** Inline-стили для блока заголовка карточки. */
  headerTitleStyle?: CSSProperties
  headerControls?: ReactNode
  leftControls?: ReactNode
  leftEdgeControls?: ReactNode
  headerControlsClass?: string
  /** Дополнительный CSS-класс для контентной области карточки. */
  contentClass?: string
  hideHeaderBorder?: boolean
  /** Полностью скрывает header карточки и отдаёт всю высоту контенту. */
  hideHeader?: boolean
  loading?: boolean
  emptyText?: string
}
/**
 * Рендерит детей как есть, но если передать null, то отобразится заглушка
 */
export const TypicalCard: FC<ChartCardProps> = ({
  className,
  style,
  title,
  date,
  emptyText,
  headerControls,
  leftEdgeControls,
  leftControls,
  headerControlsClass,
  contentClass,
  subtitle,
  headerClass,
  headerTitleClass,
  headerTitleStyle,
  hideHeaderBorder = false,
  hideHeader = false,
  children,
  loading = false,
}) => {
  return (
    <div className={cn(cls.ChartCard, className, { [cls.withoutHeader]: hideHeader })} style={style}>
      {!hideHeader && (
        <div className={cn(cls.header, headerClass, { [cls.borderless]: hideHeaderBorder })}>
          <div className={cn(cls.headerTitle, headerTitleClass)} style={headerTitleStyle}>
            {leftEdgeControls && <div className={cls.leftEdgeControls}>{leftEdgeControls}</div>}
            {title}
          </div>
          {subtitle && <Typography color="secondary" className={cls.headerSubtitle}>{subtitle}</Typography>}
          {date && <Typography color="secondary" className={cls.headerDate}>{date}</Typography>}
          {leftControls && <div className={cls.headerLeftControls}>{leftControls}</div>}
          <div className={cn(cls.headerControls, headerControlsClass)}>{headerControls}</div>
        </div>
      )}
      <div className={cn(cls.content, contentClass, { [cls.empty]: !children })}>
        {loading ? <Spin /> : <>{children || <Empty description={emptyText} />}</>}
      </div>
    </div>
  )
}

export const ChartCardLoading: FC<{ title: string }> = ({ title }) => <TypicalCard title={title} loading={true}>{null}</TypicalCard>
export const ChartCardEmpty: FC<{ title: string, emptyText?: string }> = ({ title, emptyText }) => (
  <TypicalCard title={title}>
    {emptyText ? <div className="centerOfAvailableSpace"><Empty description={emptyText} /></div> : null}
  </TypicalCard>
)
