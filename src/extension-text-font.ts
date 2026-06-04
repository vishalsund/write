import { Mark, mergeAttributes } from '@tiptap/core'
import type { TextFontRole } from './fonts'

export const TextFont = Mark.create({
  name: 'textFont',

  addAttributes() {
    return {
      font: {
        default: null as TextFontRole | null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-font')
          if (value === 'sans' || value === 'serif' || value === 'mono' || value === 'cursive') {
            return value
          }
          return null
        },
        renderHTML: (attributes) => {
          if (!attributes.font) return {}
          return {
            'data-font': attributes.font,
            class: `text-font text-font--${attributes.font}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-font]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTextFont:
        (font: TextFontRole) =>
        ({ commands }) =>
          commands.setMark(this.name, { font }),
      unsetTextFont:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textFont: {
      setTextFont: (font: TextFontRole) => ReturnType
      unsetTextFont: () => ReturnType
    }
  }
}
