import type { Editor } from '@tiptap/core'
import katex from 'katex'

export type MathMode = 'inline' | 'block'

export type MathEditRequest = {
  mode: MathMode
  latex: string
  pos: number
}

let editorRef: Editor | null = null
let editRequest: MathEditRequest | null = null
let onClose: (() => void) | null = null

const backdrop = document.getElementById('math-backdrop')!
const dialog = document.getElementById('math-dialog')!
const latexInput = document.getElementById('math-latex') as HTMLTextAreaElement
const previewEl = document.getElementById('math-preview')!
const modeInline = document.getElementById('math-mode-inline') as HTMLInputElement
const modeBlock = document.getElementById('math-mode-block') as HTMLInputElement
const btnApply = document.getElementById('math-apply')!
const btnDelete = document.getElementById('math-delete')!
const btnCancel = document.getElementById('math-cancel')!

function getMode(): MathMode {
  return modeBlock.checked ? 'block' : 'inline'
}

function setMode(mode: MathMode): void {
  modeInline.checked = mode === 'inline'
  modeBlock.checked = mode === 'block'
  modeInline.disabled = editRequest !== null
  modeBlock.disabled = editRequest !== null
}

function renderPreview(): void {
  const latex = latexInput.value.trim()
  if (!latex) {
    previewEl.innerHTML = '<span class="math-preview-empty">Preview appears here</span>'
    previewEl.classList.remove('math-preview--error')
    return
  }

  try {
    katex.render(latex, previewEl, {
      displayMode: getMode() === 'block',
      throwOnError: true,
    })
    previewEl.classList.remove('math-preview--error')
  } catch {
    previewEl.textContent = 'Invalid LaTeX'
    previewEl.classList.add('math-preview--error')
  }
}

function close(): void {
  backdrop.hidden = true
  dialog.hidden = true
  editRequest = null
  editorRef = null
  onClose?.()
  onClose = null
}

function applyMath(): void {
  if (!editorRef) return
  const latex = latexInput.value.trim()
  if (!latex) return

  const mode = getMode()

  if (editRequest) {
    if (mode === 'inline') {
      editorRef.chain().focus().updateInlineMath({ latex, pos: editRequest.pos }).run()
    } else {
      editorRef.chain().focus().updateBlockMath({ latex, pos: editRequest.pos }).run()
    }
  } else if (mode === 'inline') {
    editorRef.chain().focus().insertInlineMath({ latex }).run()
  } else {
    editorRef.chain().focus().insertBlockMath({ latex }).run()
  }

  close()
}

function deleteMath(): void {
  if (!editorRef || !editRequest) return
  if (editRequest.mode === 'inline') {
    editorRef.chain().focus().deleteInlineMath({ pos: editRequest.pos }).run()
  } else {
    editorRef.chain().focus().deleteBlockMath({ pos: editRequest.pos }).run()
  }
  close()
}

export function initMathDialog(): void {
  btnApply.addEventListener('click', applyMath)
  btnDelete.addEventListener('click', deleteMath)
  btnCancel.addEventListener('click', close)
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close()
  })

  latexInput.addEventListener('input', renderPreview)
  modeInline.addEventListener('change', renderPreview)
  modeBlock.addEventListener('change', renderPreview)

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      applyMath()
    }
  })
}

export function openMathDialog(
  editor: Editor,
  options: {
    mode?: MathMode
    latex?: string
    edit?: MathEditRequest
    afterClose?: () => void
  } = {},
): void {
  editorRef = editor
  editRequest = options.edit ?? null
  onClose = options.afterClose ?? null

  const mode = options.edit?.mode ?? options.mode ?? 'inline'
  setMode(mode)
  latexInput.value = options.edit?.latex ?? options.latex ?? ''
  btnDelete.hidden = !editRequest
  btnApply.textContent = editRequest ? 'Update' : 'Insert'

  renderPreview()
  backdrop.hidden = false
  dialog.hidden = false
  latexInput.focus()
}

export function openMathEdit(editor: Editor, request: MathEditRequest, afterClose?: () => void): void {
  openMathDialog(editor, { edit: request, afterClose })
}

export function isMathDialogOpen(): boolean {
  return !dialog.hidden
}
