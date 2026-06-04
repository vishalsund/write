import type { Editor } from '@tiptap/core'
import { openMathEdit } from './math-dialog'

/** Shared click handler for inline/block math nodes. */
export function handleMathNodeClick(editor: Editor, latex: string, pos: number, mode: 'inline' | 'block'): void {
  openMathEdit(editor, { mode, latex, pos }, () => editor.commands.focus())
}
