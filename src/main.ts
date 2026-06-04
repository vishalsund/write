import 'katex/dist/katex.min.css'
import './style.css'
import { countText, formatCounts } from './counts'
import {
  buildFilename,
  createInitialFileState,
  downloadBlob,
  getExportContent,
  inferKindFromName,
  loadTextIntoEditor,
  readFileAsText,
  saveWithFileHandle,
  stripExtension,
  supportsFileSystemAccess,
  type FileKind,
  type FileState,
} from './files'
import {
  createEditor,
  getDocumentText,
  getSelectedText,
  insertImagesFromFileList,
  runCommand,
  setHeading,
  syncHeadingSelect,
  syncToolbarActiveState,
  type EditorCommand,
  type HeadingLevel,
} from './editor'
import { closeHelp, initHelp, isCapturingKeybind, isHelpOpen, openHelp } from './help'
import { handleKeybindEvent } from './keybind-handler'
import { loadKeybinds, type KeybindAction, type KeybindMap } from './keybinds'
import { mountToolbarIcons, updateThemeIcon, updateToolbarTitles } from './toolbar-ui'
import { initLinkDialog, isLinkDialogOpen, openLinkDialog } from './link-dialog'
import { initMathDialog, isMathDialogOpen, openMathDialog } from './math-dialog'
import {
  applyEditorFont,
  getStoredFontFamily,
  getStoredFontSize,
  initEditorFont,
  type FontFamily,
} from './settings'
import { initBrandActivity, noteWritingActivity } from './brand'
import { initTheme, toggleTheme } from './theme'

const DRAFT_KEY = 'write:draft'

const docTitle = document.getElementById('doc-title') as HTMLInputElement
const editorEl = document.getElementById('editor') as HTMLElement
const fileInput = document.getElementById('file-input') as HTMLInputElement
const imageInput = document.getElementById('image-input') as HTMLInputElement
const selectionCountEl = document.getElementById('selection-count')!
const documentCountEl = document.getElementById('document-count')!
const exportMenu = document.getElementById('export-menu')!
const fontFamilySelect = document.getElementById('font-family') as HTMLSelectElement
const fontSizeSelect = document.getElementById('font-size') as HTMLSelectElement
const headingSelect = document.getElementById('heading-select') as HTMLSelectElement

let fileState: FileState = createInitialFileState()
let lastSavedSnapshot = ''
let draftTimer: ReturnType<typeof setTimeout> | null = null
let keybinds: KeybindMap = loadKeybinds()

const editor = createEditor(editorEl, () => {
  noteWritingActivity()
  refreshCounts()
  syncHeadingSelect(editor, headingSelect)
  syncToolbarActiveState(editor)
  markDirty()
  scheduleDraftSave()
})

function getTitle(): string {
  return docTitle.value.trim() || 'Untitled'
}

function getDefaultKind(): FileKind {
  return fileState.kind ?? 'md'
}

function markDirty(): void {
  const snapshot = getExportContent(editor, 'md')
  fileState.dirty = snapshot !== lastSavedSnapshot
  document.title = fileState.dirty ? `${getTitle()} * — Write` : `${getTitle()} — Write`
}

function markClean(): void {
  lastSavedSnapshot = getExportContent(editor, 'md')
  fileState.dirty = false
  document.title = `${getTitle()} — Write`
}

function refreshCounts(): void {
  const selected = getSelectedText(editor)
  const documentText = getDocumentText(editor)

  if (selected.length > 0) {
    selectionCountEl.textContent = `Selection: ${formatCounts(countText(selected))}`
    selectionCountEl.hidden = false
  } else {
    selectionCountEl.textContent = ''
    selectionCountEl.hidden = true
  }

  documentCountEl.textContent = `Document: ${formatCounts(countText(documentText))}`
}

function scheduleDraftSave(): void {
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    const payload = {
      title: getTitle(),
      markdown: getExportContent(editor, 'md'),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
  }, 400)
}

function restoreDraft(): void {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  try {
    const draft = JSON.parse(raw) as { title?: string; markdown?: string }
    if (draft.title) {
      docTitle.value = draft.title
      fileState.name = draft.title
    }
    if (draft.markdown) {
      editor.commands.setContent(draft.markdown, { contentType: 'markdown' })
      markClean()
      syncHeadingSelect(editor, headingSelect)
    }
  } catch {
    /* ignore corrupt draft */
  }
}

function applyLoadedFile(name: string, kind: FileKind, handle: FileSystemFileHandle | null): void {
  fileState = {
    name: stripExtension(name),
    kind,
    handle,
    dirty: false,
  }
  docTitle.value = fileState.name
  markClean()
  syncHeadingSelect(editor, headingSelect)
}

async function openViaPicker(): Promise<void> {
  if (!supportsFileSystemAccess()) {
    fileInput.click()
    return
  }

  try {
    const [handle] = await window.showOpenFilePicker!({
      types: [
        {
          description: 'Documents',
          accept: {
            'text/markdown': ['.md', '.markdown'],
            'text/plain': ['.txt'],
          },
        },
      ],
      multiple: false,
    })
    const file = await handle.getFile()
    const kind = inferKindFromName(file.name)
    const text = await readFileAsText(file)
    loadTextIntoEditor(editor, text, kind)
    applyLoadedFile(file.name, kind, handle)
  } catch (err) {
    if ((err as DOMException).name !== 'AbortError') {
      console.error(err)
    }
  }
}

async function handleFileInputChange(): Promise<void> {
  const file = fileInput.files?.[0]
  fileInput.value = ''
  if (!file) return

  const kind = inferKindFromName(file.name)
  const text = await readFileAsText(file)
  loadTextIntoEditor(editor, text, kind)
  applyLoadedFile(file.name, kind, null)
}

async function saveDocument(): Promise<void> {
  const kind = getDefaultKind()
  const content = getExportContent(editor, kind)
  const filename = buildFilename(getTitle(), kind)

  if (fileState.handle) {
    try {
      await saveWithFileHandle(fileState.handle, content)
      markClean()
      return
    } catch (err) {
      console.error(err)
    }
  }

  if (supportsFileSystemAccess()) {
    try {
      const handle = await window.showSaveFilePicker!({
        suggestedName: filename,
        types: [
          kind === 'txt'
            ? { description: 'Plain text', accept: { 'text/plain': ['.txt'] } }
            : { description: 'Markdown', accept: { 'text/markdown': ['.md'] } },
        ],
      })
      await saveWithFileHandle(handle, content)
      const file = await handle.getFile()
      const resolvedKind = inferKindFromName(file.name)
      applyLoadedFile(file.name, resolvedKind, handle)
      return
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return
      console.error(err)
    }
  }

  const mime = kind === 'txt' ? 'text/plain' : 'text/markdown'
  downloadBlob(filename, new Blob([content], { type: mime }))
  fileState.kind = kind
  markClean()
}

function exportAs(kind: FileKind): void {
  const content = getExportContent(editor, kind)
  const filename = buildFilename(getTitle(), kind)
  const mime = kind === 'txt' ? 'text/plain' : 'text/markdown'
  downloadBlob(filename, new Blob([content], { type: mime }))
  exportMenu.hidden = true
}

function syncFontControls(): void {
  fontFamilySelect.value = getStoredFontFamily()
  fontSizeSelect.value = String(getStoredFontSize())
}

function refreshToolbarTitles(): void {
  updateToolbarTitles(keybinds)
}

function executeAction(action: KeybindAction): void {
  switch (action) {
    case 'save':
      void saveDocument()
      break
    case 'open':
      void openViaPicker()
      break
    case 'help':
      openHelp()
      break
    case 'link':
      openLinkDialog(editor, () => editor.commands.focus())
      break
    case 'math':
      openMathDialog(editor, { afterClose: () => editor.commands.focus() })
      break
    case 'code':
    case 'codeBlock':
      runCommand(editor, action)
      break
    case 'heading1':
      setHeading(editor, 1)
      break
    case 'heading2':
      setHeading(editor, 2)
      break
    case 'heading3':
      setHeading(editor, 3)
      break
    case 'heading4':
      setHeading(editor, 4)
      break
    case 'heading5':
      setHeading(editor, 5)
      break
    case 'heading6':
      setHeading(editor, 6)
      break
    case 'paragraph':
      setHeading(editor, 0)
      break
    default:
      runCommand(editor, action as EditorCommand)
  }
  syncHeadingSelect(editor, headingSelect)
  syncToolbarActiveState(editor)
}

function shouldIgnoreKeybinds(): boolean {
  return isCapturingKeybind() || isLinkDialogOpen() || isMathDialogOpen()
}

function bindKeybinds(): void {
  // Capture phase runs before ProseMirror/TipTap consume the event.
  document.addEventListener(
    'keydown',
    (event) => {
      handleKeybindEvent(
        event,
        editor,
        keybinds,
        (action) => executeAction(action),
        shouldIgnoreKeybinds,
      )
    },
    true,
  )
}

function bindToolbar(): void {
  document.querySelector('.toolbar')?.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-cmd]')
    if (!target?.dataset.cmd) return
    const cmd = target.dataset.cmd as EditorCommand
    if (cmd === 'link') {
      openLinkDialog(editor, () => editor.commands.focus())
      return
    }
    if (cmd === 'math') {
      openMathDialog(editor, { afterClose: () => editor.commands.focus() })
      return
    }
    runCommand(editor, cmd)
    syncHeadingSelect(editor, headingSelect)
    syncToolbarActiveState(editor)
  })

  headingSelect.addEventListener('change', () => {
    const level = Number(headingSelect.value) as HeadingLevel | 0
    setHeading(editor, level)
  })

  document.getElementById('btn-image')!.addEventListener('click', () => {
    imageInput.click()
  })

  imageInput.addEventListener('change', () => {
    insertImagesFromFileList(editor, imageInput.files)
    imageInput.value = ''
  })
}

function bindUi(): void {
  document.getElementById('btn-open')!.addEventListener('click', () => void openViaPicker())
  document.getElementById('btn-save')!.addEventListener('click', () => void saveDocument())
  document.getElementById('btn-help')!.addEventListener('click', () => openHelp())
  document.getElementById('theme-toggle')!.addEventListener('click', () => {
    toggleTheme()
    updateThemeIcon()
  })
  document.addEventListener('write:theme-change', () => updateThemeIcon())

  document.getElementById('btn-export')!.addEventListener('click', () => {
    exportMenu.hidden = !exportMenu.hidden
  })

  exportMenu.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-export]')
    if (!btn?.dataset.export) return
    exportAs(btn.dataset.export as FileKind)
  })

  document.addEventListener('click', (event) => {
    document.querySelectorAll('.menu-wrap').forEach((wrap) => {
      if (!wrap.contains(event.target as Node)) {
        const menu = wrap.querySelector('.dropdown-menu')
        if (menu instanceof HTMLElement) menu.hidden = true
      }
    })
  })

  fileInput.addEventListener('change', () => void handleFileInputChange())

  docTitle.addEventListener('input', () => {
    fileState.name = getTitle()
    markDirty()
    scheduleDraftSave()
  })

  fontFamilySelect.addEventListener('change', () => {
    applyEditorFont(fontFamilySelect.value as FontFamily, Number(fontSizeSelect.value))
  })

  fontSizeSelect.addEventListener('change', () => {
    applyEditorFont(fontFamilySelect.value as FontFamily, Number(fontSizeSelect.value))
  })

  const editorWrap = document.querySelector('.editor-wrap')!
  editorWrap.addEventListener('dragover', (event) => {
    const drag = event as DragEvent
    if (drag.dataTransfer?.types.includes('Files')) {
      drag.preventDefault()
    }
  })

  window.addEventListener('beforeunload', (event) => {
    if (fileState.dirty) {
      event.preventDefault()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isHelpOpen()) {
      closeHelp()
      editor.commands.focus()
    }
  })
}

initTheme()
initBrandActivity()
initEditorFont()
initHelp({
  onClose: () => editor.commands.focus(),
  onKeybindsChange: (map) => {
    keybinds = map
    refreshToolbarTitles()
  },
})
initLinkDialog()
initMathDialog()
mountToolbarIcons()
syncFontControls()
refreshToolbarTitles()
bindToolbar()
bindKeybinds()
bindUi()
restoreDraft()
refreshCounts()
syncHeadingSelect(editor, headingSelect)
syncToolbarActiveState(editor)
editor.commands.focus()
