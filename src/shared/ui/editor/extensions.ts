import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
    }
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
    }
  }
}

interface TextStyleCommandChain {
  focus: () => TextStyleCommandChain
  setMark: (name: string, attributes: Record<string, unknown>) => TextStyleCommandChain
  run: () => boolean
}

function setTextStyleAttribute(
  chain: TextStyleCommandChain | null | undefined,
  attribute: string,
  value: string | null,
) {
  if (!chain)
    return false

  return chain
    .focus()
    .setMark('textStyle', { [attribute]: value })
    .run()
}

export const FontSizeExtension = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const fontSize = element.style.fontSize
              return fontSize ? fontSize.replace('px', '') : null
            },
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontSize)
                return {}
              return { style: `font-size: ${attributes.fontSize}px` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
          ({ chain }: { chain: () => TextStyleCommandChain | null }) =>
            setTextStyleAttribute(chain(), 'fontSize', fontSize),
    }
  },
})

export const LineHeightExtension = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.lineHeight)
                return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
          ({ chain }: { chain: () => TextStyleCommandChain | null }) =>
            setTextStyleAttribute(chain(), 'lineHeight', lineHeight),
    }
  },
})
