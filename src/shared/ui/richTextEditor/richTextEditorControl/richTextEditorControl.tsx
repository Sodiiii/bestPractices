import type { Editor as TiptapEditor } from '@tiptap/react'
import type { IconButtonProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from '../richTextEditor.module.scss'
import { useRichTextEditorContext } from '../richTextEditor'

type RichTextEditorControlProps = {
  active?: boolean
  title?: string
} & IconButtonProps

export const RichTextEditorControl = React.forwardRef<HTMLButtonElement, RichTextEditorControlProps>(({
  children,
  active,
  title,
  className,
  ...rest
}, ref) => {
  return (
    <IconButton
      {...rest}
      title={title}
      ref={ref}
      type="button"
      variant={active ? 'solid' : 'ghost'}
      aria-label={title}
      size="sm"
      className={cn(cls.control, active && cls.active, className)}
    >
      {children}
    </IconButton>
  )
})

RichTextEditorControl.displayName = 'RichTextEditorControl'

type CreateControlConfig = {
  label: string
  icon: React.ReactNode
  isActive?: { name: string, attributes?: Record<string, any> | string }
  isDisabled?: (editor: TiptapEditor | null) => boolean
  operation: { name: string, attributes?: Record<string, any> | string }
}

export function createControl({
  label,
  icon,
  isActive,
  isDisabled,
  operation,
}: CreateControlConfig) {
  const Control = React.forwardRef<HTMLButtonElement, RichTextEditorControlProps>((props, ref) => {
    const { editor, labels } = useRichTextEditorContext()
    const _label = labels[label] as string
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <RichTextEditorControl
            ref={ref}
            onClick={() => (editor as any)?.chain().focus()[operation.name](operation.attributes).run()}
            active={isActive?.name ? editor.isActive(isActive.name, isActive.attributes) : false}
            disabled={isDisabled?.(editor) || false}
            title={_label}
            aria-label={_label}
            {...props}
          >
            {icon}
          </RichTextEditorControl>
        </TooltipTrigger>
        <TooltipContent>{_label}</TooltipContent>
      </Tooltip>
    )
  })
  return Control
}
