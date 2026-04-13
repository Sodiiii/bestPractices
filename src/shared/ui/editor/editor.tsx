import { useEditor } from '@tiptap/react'
import Color from '@tiptap/extension-color'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'

import { useDebouncedCallback } from '@/shared/lib/hooks/useDebouncedCallback.'

import { RichTextEditor } from '../richTextEditor'

export type EditorProps = {
  content: string
  onUpdate: (value: string) => void
  debounceMs?: number
}

export function Editor({ content, onUpdate, debounceMs = 250 }: EditorProps) {
  const handleDeounceUpdate = useDebouncedCallback((value: string) => onUpdate(value), debounceMs)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      handleDeounceUpdate(editor.getHTML())
    },
  })
  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.Undo />
        <RichTextEditor.Redo />
        <RichTextEditor.AlignLeft />
        <RichTextEditor.AlignCenter />
        <RichTextEditor.AlignRight />
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Highlight />
        <RichTextEditor.Color />
        <RichTextEditor.Heading />
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  )
}
