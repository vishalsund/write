import type { Editor } from '@tiptap/core'

const backdrop = document.getElementById('link-backdrop')!
const dialog = document.getElementById('link-dialog')!
const urlInput = document.getElementById('link-url') as HTMLInputElement
const textInput = document.getElementById('link-text') as HTMLInputElement
const btnApply = document.getElementById('link-apply')!
const btnRemove = document.getElementById('link-remove')!
const btnCancel = document.getElementById('link-cancel')!

let editorRef: Editor | null = null
let onClose: (() => void) | null = null

function close(): void {
  backdrop.hidden = true
  dialog.hidden = true
  onClose?.()
}

function applyLink(): void {
  if (!editorRef) return
  const url = urlInput.value.trim()
  if (!url) return

  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
  const { from, to } = editorRef.state.selection
  const hasSelection = from !== to

  if (hasSelection) {
    editorRef.chain().focus().extendMarkRange('link').setLink({ href }).run()
  } else {
    const text = textInput.value.trim() || href
    editorRef
      .chain()
      .focus()
      .insertContent({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text,
            marks: [{ type: 'link', attrs: { href } }],
          },
        ],
      })
      .run()
  }
  close()
}

function removeLink(): void {
  if (!editorRef) return
  editorRef.chain().focus().extendMarkRange('link').unsetLink().run()
  close()
}

export function initLinkDialog(): void {
  btnApply.addEventListener('click', applyLink)
  btnRemove.addEventListener('click', removeLink)
  btnCancel.addEventListener('click', close)
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close()
  })

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      applyLink()
    }
  })
}

export function openLinkDialog(editor: Editor, afterClose?: () => void): void {
  editorRef = editor
  onClose = afterClose ?? null

  const { from, to } = editor.state.selection
  const selectedText = from === to ? '' : editor.state.doc.textBetween(from, to, ' ')
  const existing = editor.getAttributes('link')

  urlInput.value = existing.href ?? ''
  textInput.value = selectedText
  textInput.disabled = from !== to
  btnRemove.hidden = !existing.href

  backdrop.hidden = false
  dialog.hidden = false
  urlInput.focus()
  urlInput.select()
}

export function isLinkDialogOpen(): boolean {
  return !dialog.hidden
}
