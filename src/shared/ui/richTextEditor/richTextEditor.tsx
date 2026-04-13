import type { Editor as TiptapEditor } from '@tiptap/react'

import * as React from 'react'
import { Flex } from '@tinkerbells/xenon-ui'
import { EditorContent } from '@tiptap/react'
import { createContext, useContext, useMemo } from 'react'

import { cn } from '@/shared/lib/classNames'

import cls from './richTextEditor.module.scss'
import * as controls from './richTextEditorControl'
import { DEFAULT_LABELS } from './richTextEditorConfig'

type RichTextEditorContextProps = {
  editor: TiptapEditor | null
  labels: Record<string, string>
}

const RichTextEditorContext = createContext<RichTextEditorContextProps | null>(null)

export function useRichTextEditorContext() {
  const context = useContext(RichTextEditorContext)
  if (!context) {
    throw new Error('RichTextEditor component was not found in tree')
  }
  return context
}

type RichTextEditorControlsGroupProps = {
  children: React.ReactNode
}

// TODO: доделать работу с border
function RichTextEditorControlsGroup({ children }: RichTextEditorControlsGroupProps) {
  const childrenWithClass = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        className: cn(child.props.className, 'xenon-choice-group__item'),
      })
    }
    return child
  })

  return (
    <Flex className={cn(cls.controlsGroup, 'xenon-choice-group')}>
      {childrenWithClass}
    </Flex>
  )
}

type RichTextEditorToolbarProps = {
  children: React.ReactNode
}

function RichTextEditorToolbar({ children }: RichTextEditorToolbarProps) {
  return (
    <Flex wrap gap="small" className={cls.toolbar}>
      {children}
    </Flex>
  )
}

type RichTextEditorContentProps = {
  className?: string
}

function RichTextEditorContent({ className }: RichTextEditorContentProps) {
  const { editor } = useRichTextEditorContext()

  return (
    <div className={cls.content}>
      <EditorContent editor={editor} className={className} />
    </div>
  )
}

type RichTextEditorProps = {
  editor: TiptapEditor | null
  children: React.ReactNode
  labels?: Partial<typeof DEFAULT_LABELS>
}

/**
 * Rich text editor component with modular architecture similar to Mantine
 *
 * @example
 * ```tsx
 * import { useEditor } from '@tiptap/react'
 * import StarterKit from '@tiptap/starter-kit'
 * import Heading from '@tiptap/extension-heading'
 * import Highlight from '@tiptap/extension-highlight'
 * import TextAlign from '@tiptap/extension-text-align'
 *
 * function MyEditor() {
 *   const editor = useEditor({
 *     extensions: [
 *       StarterKit,
 *       Heading.configure({ levels: [2, 3, 4] }),
 *       Highlight.configure({ multicolor: true }),
 *       TextAlign.configure({ types: ['heading', 'paragraph'] }),
 *     ],
 *     content: '<p>Hello world!</p>',
 *   })
 *
 *   return (
 *     <RichTextEditor editor={editor}>
 *       <RichTextEditor.Toolbar>
 *         <RichTextEditor.ControlsGroup>
 *           <RichTextEditor.Undo />
 *           <RichTextEditor.Redo />
 *         </RichTextEditor.ControlsGroup>
 *
 *         <RichTextEditor.Heading />
 *
 *         <RichTextEditor.ControlsGroup>
 *           <RichTextEditor.Bold />
 *           <RichTextEditor.Italic />
 *           <RichTextEditor.OrderedList />
 *           <RichTextEditor.AlignLeft />
 *           <RichTextEditor.AlignCenter />
 *           <RichTextEditor.AlignRight />
 *           <RichTextEditor.Highlight />
 *         </RichTextEditor.ControlsGroup>
 *
 *         <RichTextEditor.Color />
 *       </RichTextEditor.Toolbar>
 *
 *       <RichTextEditor.Content />
 *     </RichTextEditor>
 *   )
 * }
 * ```
 */
export function RichTextEditor({
  editor,
  children,
  labels,
}: RichTextEditorProps) {
  const mergedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])

  return (
    <RichTextEditorContext.Provider
      value={{
        editor,
        labels: mergedLabels,
      }}
    >
      <div className={cls.root}>
        {children}
      </div>
    </RichTextEditorContext.Provider>
  )
}

RichTextEditor.Toolbar = RichTextEditorToolbar
RichTextEditor.ControlsGroup = RichTextEditorControlsGroup
RichTextEditor.Content = RichTextEditorContent
RichTextEditor.Bold = controls.BoldControl
RichTextEditor.Italic = controls.ItalicControl
RichTextEditor.OrderedList = controls.OrderedListControl
RichTextEditor.AlignLeft = controls.AlignLeftControl
RichTextEditor.AlignCenter = controls.AlignCenterControl
RichTextEditor.AlignRight = controls.AlignRightControl
RichTextEditor.Highlight = controls.HighlightControl
RichTextEditor.Undo = controls.UndoControl
RichTextEditor.Redo = controls.RedoControl
RichTextEditor.Heading = controls.HeadingControl
RichTextEditor.Color = controls.ColorControl
