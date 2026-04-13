import type { Editor as TiptapEditor } from '@tiptap/react'
import type { IconButtonProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@tinkerbells/xenon-ui'

import { cn } from '@/shared/lib/classNames'

import cls from '../richTextEditor.module.scss'
import { useRichTextEditorContext } from '../richTextEditor'

interface RichTextEditorControlProps extends IconButtonProps {
  active?: boolean
  title?: string
}

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

interface CreateControlConfig {
  label: string
  icon: React.ReactNode
  isActive?: { name: string, attributes?: Record<string, unknown> | string }
  isDisabled?: (editor: TiptapEditor | null) => boolean
  operation: { name: string, attributes?: Record<string, unknown> | string }
}

function runEditorOperation(
  editor: TiptapEditor | null,
  operation: CreateControlConfig['operation'],
) {
  const chain = editor?.chain().focus()
  if (!chain)
    return

  const operationRecord = chain as unknown as Record<string, unknown>
  const command = operationRecord[operation.name]

  if (typeof command !== 'function')
    return

  const next = operation.attributes === undefined
    ? command.call(chain)
    : command.call(chain, operation.attributes)

  if (next && typeof next === 'object' && 'run' in next && typeof next.run === 'function') {
    next.run()
  }
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
            onClick={() => runEditorOperation(editor, operation)}
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
