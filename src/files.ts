import type { Editor } from '@tiptap/core'

export type FileKind = 'md' | 'txt'

export type FileState = {
  name: string
  kind: FileKind | null
  handle: FileSystemFileHandle | null
  dirty: boolean
}

export function createInitialFileState(): FileState {
  return {
    name: 'Untitled',
    kind: null,
    handle: null,
    dirty: false,
  }
}

export function inferKindFromName(name: string): FileKind {
  return name.toLowerCase().endsWith('.txt') ? 'txt' : 'md'
}

export function stripExtension(name: string): string {
  return name.replace(/\.(md|markdown|txt)$/i, '') || name
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function getEditorMarkdown(editor: Editor): string {
  if (typeof editor.getMarkdown === 'function') {
    return editor.getMarkdown()
  }
  return editor.getText()
}

export function getExportContent(editor: Editor, kind: FileKind): string {
  if (kind === 'txt') {
    return editor.getText()
  }
  return getEditorMarkdown(editor)
}

export function buildFilename(baseName: string, kind: FileKind): string {
  const safe = baseName.trim() || 'Untitled'
  const ext = kind === 'txt' ? '.txt' : '.md'
  if (safe.toLowerCase().endsWith(ext)) return safe
  return `${safe}${ext}`
}

export async function readFileAsText(file: File): Promise<string> {
  return file.text()
}

export function loadTextIntoEditor(
  editor: Editor,
  text: string,
  kind: FileKind,
): void {
  if (kind === 'md') {
    editor.commands.setContent(text, { contentType: 'markdown' })
  } else {
    const paragraphs = text.split(/\n/)
    const content = paragraphs.map((line) => ({
      type: 'paragraph' as const,
      content: line ? [{ type: 'text' as const, text: line }] : [],
    }))
    editor.commands.setContent({ type: 'doc', content })
  }
}

export async function saveWithFileHandle(
  handle: FileSystemFileHandle,
  content: string,
): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export function supportsFileSystemAccess(): boolean {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window
}
