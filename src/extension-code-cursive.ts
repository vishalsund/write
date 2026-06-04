import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findKeywordMatches } from './code-keywords'

const pluginKey = new PluginKey('codeCursiveKeywords')

export function createCodeCursivePlugin(enabled: () => boolean) {
  return new Plugin({
    key: pluginKey,
    props: {
      decorations(state) {
        if (!enabled()) return DecorationSet.empty

        const decorations: Decoration[] = []

        state.doc.nodesBetween(0, state.doc.content.size, (node, pos, parent) => {
          if (!node.isText) return

          const inCodeBlock = parent?.type.name === 'codeBlock'
          const inlineCode = node.marks.some((mark) => mark.type.name === 'code')
          if (!inCodeBlock && !inlineCode) return

          const text = node.text ?? ''
          const base = pos

          for (const { from, to } of findKeywordMatches(text)) {
            decorations.push(
              Decoration.inline(base + from, base + to, {
                class: 'code-token-cursive',
              }),
            )
          }
        })

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}

export type CodeCursiveKeywordsOptions = {
  enabled: () => boolean
}

export const CodeCursiveKeywords = Extension.create<CodeCursiveKeywordsOptions>({
  name: 'codeCursiveKeywords',

  addOptions() {
    return {
      enabled: () => true,
    }
  },

  addProseMirrorPlugins() {
    return [createCodeCursivePlugin(() => this.options.enabled())]
  },
})
