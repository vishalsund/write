import { Editor } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Mathematics } from '@tiptap/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { handleMathNodeClick } from './math-bridge'
import { CodeCursiveKeywords } from './extension-code-cursive'
import { TextFont } from './extension-text-font'
import { getCodeCursiveKeywordsEnabled } from './settings'

export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'bulletList'
  | 'orderedList'
  | 'undo'
  | 'redo'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'paragraph'
  | 'link'
  | 'code'
  | 'codeBlock'
  | 'math'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

function insertImagesFromFiles(editor: Editor, files: File[], position?: number): void {
  const images = files.filter((f) => f.type.startsWith('image/'))
  if (!images.length) return

  for (const file of images) {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const chain = editor.chain().focus()
      if (position !== undefined) {
        chain.insertContentAt(position, {
          type: 'image',
          attrs: { src, alt: file.name },
        })
      } else {
        chain.setImage({ src, alt: file.name })
      }
      chain.run()
    }
    reader.readAsDataURL(file)
  }
}

function handleImageDrop(editor: Editor, event: DragEvent): boolean {
  const files = event.dataTransfer?.files
  if (!files?.length) return false

  const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!images.length) return false

  event.preventDefault()
  const coords = editor.view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  })
  insertImagesFromFiles(editor, images, coords?.pos)
  return true
}

function handleImagePaste(editor: Editor, event: ClipboardEvent): boolean {
  const items = event.clipboardData?.items
  if (!items) return false

  const files: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }
  if (!files.length) return false

  event.preventDefault()
  insertImagesFromFiles(editor, files)
  return true
}

const katexOptions = {
  throwOnError: false,
}

export function createEditor(
  element: HTMLElement,
  onUpdate: () => void,
  onSelectionUpdate?: () => void,
): Editor {
  const editor = new Editor({
    element,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
        codeBlock: {
          HTMLAttributes: { class: 'editor-code-block' },
          enableTabIndentation: true,
          tabSize: 2,
        },
        code: {
          HTMLAttributes: { class: 'editor-inline-code' },
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Mathematics.configure({
        katexOptions,
        inlineOptions: {
          onClick: (node, pos) => {
            handleMathNodeClick(editor, node.attrs.latex, pos, 'inline')
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            handleMathNodeClick(editor, node.attrs.latex, pos, 'block')
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing…',
      }),
      TextFont,
      CodeCursiveKeywords.configure({
        enabled: () => getCodeCursiveKeywordsEnabled(),
      }),
      Markdown,
    ],
    content: '',
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'prose-editor',
        spellcheck: 'true',
      },
      handleDrop: (_view, event) => {
        if (handleImageDrop(editor, event)) return true
        return false
      },
      handlePaste: (_view, event) => {
        if (handleImagePaste(editor, event)) return true
        return false
      },
    },
    onUpdate,
    onSelectionUpdate: onSelectionUpdate ?? onUpdate,
  })

  return editor
}

export function runCommand(editor: Editor, cmd: EditorCommand): boolean {
  const chain = editor.chain().focus()

  switch (cmd) {
    case 'bold':
      return chain.toggleBold().run()
    case 'italic':
      return chain.toggleItalic().run()
    case 'bulletList':
      return chain.toggleBulletList().run()
    case 'orderedList':
      return chain.toggleOrderedList().run()
    case 'undo':
      return editor.commands.undo()
    case 'redo':
      return editor.commands.redo()
    case 'heading1':
      return chain.setHeading({ level: 1 }).run()
    case 'heading2':
      return chain.setHeading({ level: 2 }).run()
    case 'heading3':
      return chain.setHeading({ level: 3 }).run()
    case 'heading4':
      return chain.setHeading({ level: 4 }).run()
    case 'heading5':
      return chain.setHeading({ level: 5 }).run()
    case 'heading6':
      return chain.setHeading({ level: 6 }).run()
    case 'paragraph':
      return chain.setParagraph().run()
    case 'code':
      return chain.toggleCode().run()
    case 'codeBlock':
      return chain.toggleCodeBlock().run()
    case 'link':
    case 'math':
      return false
    default:
      return false
  }
}

export function syncToolbarActiveState(editor: Editor): void {
  document.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((btn) => {
    const cmd = btn.dataset.cmd
    let active = false
    if (cmd === 'bold') active = editor.isActive('bold')
    else if (cmd === 'italic') active = editor.isActive('italic')
    else if (cmd === 'code') active = editor.isActive('code')
    else if (cmd === 'codeBlock') active = editor.isActive('codeBlock')
    else if (cmd === 'bulletList') active = editor.isActive('bulletList')
    else if (cmd === 'orderedList') active = editor.isActive('orderedList')
    btn.classList.toggle('is-active', active)
  })
}

export function setHeading(editor: Editor, level: HeadingLevel | 0): void {
  const chain = editor.chain().focus()
  if (level === 0) {
    chain.setParagraph().run()
  } else {
    chain.setHeading({ level }).run()
  }
}

export function syncHeadingSelect(editor: Editor, select: HTMLSelectElement): void {
  if (editor.isActive('codeBlock')) {
    select.value = '0'
    return
  }
  if (editor.isActive('heading', { level: 1 })) select.value = '1'
  else if (editor.isActive('heading', { level: 2 })) select.value = '2'
  else if (editor.isActive('heading', { level: 3 })) select.value = '3'
  else if (editor.isActive('heading', { level: 4 })) select.value = '4'
  else if (editor.isActive('heading', { level: 5 })) select.value = '5'
  else if (editor.isActive('heading', { level: 6 })) select.value = '6'
  else select.value = '0'
}

export function insertImagesFromFileList(editor: Editor, files: FileList | null): void {
  if (!files) return
  insertImagesFromFiles(editor, Array.from(files))
}

export function getSelectedText(editor: Editor): string {
  const { from, to } = editor.state.selection
  if (from === to) return ''
  return editor.state.doc.textBetween(from, to, ' ')
}

export function getDocumentText(editor: Editor): string {
  return editor.getText()
}
