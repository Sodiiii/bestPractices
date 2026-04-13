import type { ColorPickerProps, SelectProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { ColorPicker, Select, Tooltip, TooltipContent, TooltipTrigger } from '@tinkerbells/xenon-ui'
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, HighlightOutlined, ItalicOutlined, OrderedListOutlined, RollbackOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'

import cls from '../richTextEditor.module.scss'
import { createControl } from './richTextEditorControl'
import { useRichTextEditorContext } from '../richTextEditor'

export const UndoControl = createControl({
  label: 'undoControlLabel',
  icon: <RollbackOutlined />,
  isDisabled: editor => !editor?.can().undo(),
  operation: { name: 'undo' },
})

export const RedoControl = createControl({
  label: 'redoControlLabel',
  icon: <RollbackOutlined style={{ transform: 'scaleX(-1)' }} />,
  isDisabled: editor => !editor?.can().redo(),
  operation: { name: 'redo' },
})

export const BoldControl = createControl({
  label: 'boldControlLabel',
  icon: <BoldOutlined />,
  isActive: { name: 'bold' },
  operation: { name: 'toggleBold' },
})

export const ItalicControl = createControl({
  label: 'italicControlLabel',
  icon: <ItalicOutlined />,
  isActive: { name: 'italic' },
  operation: { name: 'toggleItalic' },
})

export const OrderedListControl = createControl({
  label: 'orderedListControlLabel',
  icon: <OrderedListOutlined />,
  isActive: { name: 'orderedList' },
  operation: { name: 'toggleOrderedList' },
})

export const AlignLeftControl = createControl({
  label: 'alignLeftControlLabel',
  icon: <AlignLeftOutlined />,
  isActive: { name: 'textAlign', attributes: { textAlign: 'left' } },
  operation: { name: 'setTextAlign', attributes: 'left' },
})

export const AlignCenterControl = createControl({
  label: 'alignCenterControlLabel',
  icon: <AlignCenterOutlined />,
  isActive: { name: 'textAlign', attributes: { textAlign: 'center' } },
  operation: { name: 'setTextAlign', attributes: 'center' },
})

export const AlignRightControl = createControl({
  label: 'alignRightControlLabel',
  icon: <AlignRightOutlined />,
  isActive: { name: 'textAlign', attributes: { textAlign: 'right' } },
  operation: { name: 'setTextAlign', attributes: 'right' },
})

export const HighlightControl = createControl({
  label: 'highlightControlLabel',
  icon: <HighlightOutlined />,
  isActive: { name: 'highlight' },
  operation: { name: 'toggleHighlight', attributes: { color: '#ffec99' } },
})

type RichTextEditorHeadingControlProps = {
  title?: string
} & Omit<SelectProps, 'options' | 'onSelect'>

export const HeadingControl = React.forwardRef<HTMLButtonElement, RichTextEditorHeadingControlProps>(({ className, title, ...rest }) => {
  const { editor } = useRichTextEditorContext()
  const currentValue = editor?.isActive('heading', { level: 2 })
    ? 2
    : editor?.isActive('heading', { level: 3 })
      ? 3
      : editor?.isActive('heading', { level: 4 })
        ? 4
        : 'paragraph'

  const handleSelect = React.useCallback((value: any) => {
    if (value === 2 || value === 3 || value === 4) {
      editor?.chain().focus().toggleHeading({ level: value }).run()
    }
    else {
      editor?.chain().focus().setParagraph().run()
    }
  }, [editor])

  return (

    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select
            {...rest}
            size="small"
            placeholder="Стиль текста"
            value={currentValue}
            options={[
              { value: 2, label: 'Заголовок 1' },
              { value: 3, label: 'Заголовок 2' },
              { value: 4, label: 'Заголовок 3' },
              { value: 'paragraph', label: 'Стандартный' },
            ]}
            onSelect={handleSelect}
            className={cn(cls.headingSelect, className)}
            popupClassName={cls.headingSelectPopup}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Стиль текста</TooltipContent>
    </Tooltip>
  )
})

type RichTextEditorColorPickerControlProps = {
  title?: string
} & ColorPickerProps

export const ColorControl = React.forwardRef<HTMLDivElement, RichTextEditorColorPickerControlProps>(({ title, ...rest }, ref) => {
  const { editor } = useRichTextEditorContext()

  const handleChange = React.useCallback((color: Parameters<ColorPickerProps['onChange']>[0]) => {
    const hexColor = color.toHexString()
    if (editor?.isActive('textStyle', { color: hexColor })) {
      editor.chain().focus().unsetColor().run()
    }
    else {
      editor?.chain().focus().setColor(hexColor).run()
    }
  }, [editor])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={ref} className={cls.colorPicker} title={title}>
          <ColorPicker
            {...rest}
            value={editor?.getAttributes('textStyle').color || '#000000'}
            onChange={handleChange}
            size="small"
            presets={[
              {
                label: 'Рекомендуемые цвета',
                colors: [
                  '#000000',
                  '#1677ff',
                  '#52c41a',
                  '#faad14',
                  '#f5222d',
                  '#722ed1',
                ],
              },
            ]}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Цвет текста</TooltipContent>
    </Tooltip>
  )
})
