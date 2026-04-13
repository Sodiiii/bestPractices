import type { SelectProps } from '@tinkerbells/xenon-ui'

import * as React from 'react'
import { Select, Tooltip, TooltipContent, TooltipTrigger } from '@tinkerbells/xenon-ui'
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, HighlightOutlined, ItalicOutlined, OrderedListOutlined, RollbackOutlined } from '@ant-design/icons'

import { cn } from '@/shared/lib/classNames'
import { SelectColorPicker } from '@/shared/ui/selectColorPicker'

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

interface RichTextEditorHeadingControlProps extends Omit<SelectProps, 'options' | 'onSelect'> {
  /** Текст подсказки для селекта заголовков. */
  title?: string
}

export const HeadingControl = React.forwardRef<HTMLDivElement, RichTextEditorHeadingControlProps>(({ className, title, ...rest }, ref) => {
  const { editor } = useRichTextEditorContext()
  const currentValue = editor?.isActive('heading', { level: 2 })
    ? 2
    : editor?.isActive('heading', { level: 3 })
      ? 3
      : editor?.isActive('heading', { level: 4 })
        ? 4
        : 'paragraph'

  const handleSelect = React.useCallback((value: unknown) => {
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
        <div ref={ref}>
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

HeadingControl.displayName = 'HeadingControl'

interface RichTextEditorColorPickerControlProps {
  /** Подсказка контрола выбора цвета. */
  title?: string
}

export const ColorControl = React.forwardRef<HTMLDivElement, RichTextEditorColorPickerControlProps>(({ title, ...rest }, ref) => {
  const { editor } = useRichTextEditorContext()

  const handleChange = React.useCallback((hexColor: string) => {
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
          <SelectColorPicker
            {...rest}
            value={editor?.getAttributes('textStyle').color || '#000000'}
            onChange={handleChange}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Цвет текста</TooltipContent>
    </Tooltip>
  )
})

ColorControl.displayName = 'ColorControl'

interface RichTextEditorMetricControlProps extends Omit<SelectProps, 'options' | 'onSelect'> {
  /** Подсказка для metric-контрола. */
  title?: string
}

const FONT_SIZE_OPTIONS = [
  { value: '12', label: '12 px' },
  { value: '14', label: '14 px' },
  { value: '16', label: '16 px' },
  { value: '18', label: '18 px' },
  { value: '20', label: '20 px' },
  { value: '24', label: '24 px' },
  { value: '28', label: '28 px' },
  { value: '32', label: '32 px' },
]

const LINE_HEIGHT_OPTIONS = [
  { value: '1.1', label: '1.1' },
  { value: '1.25', label: '1.25' },
  { value: '1.4', label: '1.4' },
  { value: '1.5', label: '1.5' },
  { value: '1.7', label: '1.7' },
  { value: '2', label: '2.0' },
]

/**
 * Рендерит селект для блочных typographic-метрик редактора.
 *
 * Алгоритм:
 * - читает текущее значение атрибута из `textStyle` mark активного selection;
 * - при выборе нового значения вызывает кастомную tiptap-команду по имени;
 * - все команды запускает через dynamic access, чтобы не зависеть от module augmentation команд tiptap.
 */
function createMetricSelectControl({
  tooltip,
  commandName,
  options,
}: {
  tooltip: string
  commandName: 'setFontSize' | 'setLineHeight'
  options: Array<{ value: string, label: string }>
}) {
  const Control = React.forwardRef<HTMLDivElement, RichTextEditorMetricControlProps>(({ className, title, ...rest }, ref) => {
    const { editor } = useRichTextEditorContext()
    const currentValue = String(editor?.getAttributes('textStyle')[commandName === 'setFontSize' ? 'fontSize' : 'lineHeight'] ?? options[0]?.value ?? '')

    const handleSelect = React.useCallback((value: unknown) => {
      const chain = editor?.chain().focus() as unknown as Record<string, unknown> | undefined
      const command = chain?.[commandName]
      if (typeof command !== 'function')
        return
      const next = command.call(chain, String(value))
      if (next && typeof next === 'object' && 'run' in next && typeof next.run === 'function')
        next.run()
    }, [editor])

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div ref={ref}>
            <Select
              {...rest}
              size="small"
              value={currentValue}
              options={options}
              onSelect={handleSelect}
              className={cn(cls.metricSelect, className)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>{title || tooltip}</TooltipContent>
      </Tooltip>
    )
  })

  Control.displayName = commandName
  return Control
}

export const FontSizeControl = createMetricSelectControl({
  tooltip: 'Размер текста',
  commandName: 'setFontSize',
  options: FONT_SIZE_OPTIONS,
})

export const LineHeightControl = createMetricSelectControl({
  tooltip: 'Межстрочный интервал',
  commandName: 'setLineHeight',
  options: LINE_HEIGHT_OPTIONS,
})
