import {
  chordFromKeyboardEvent,
  formatChord,
  getActionOrder,
  KEYBIND_LABELS,
  loadKeybinds,
  resetKeybinds,
  saveKeybinds,
  type KeybindAction,
  type KeybindMap,
} from './keybinds'

export type HelpCallbacks = {
  onClose: () => void
  onKeybindsChange: (map: KeybindMap) => void
}

let keybinds = loadKeybinds()
let capturingAction: KeybindAction | null = null

const backdrop = document.getElementById('help-backdrop')!
const dialog = document.getElementById('help-dialog')!
const list = document.getElementById('help-list')!
const btnClose = document.getElementById('help-close')!
const btnReset = document.getElementById('help-reset')!

let callbacks: HelpCallbacks | null = null

function renderList(): void {
  list.innerHTML = ''
  for (const action of getActionOrder()) {
    const row = document.createElement('div')
    row.className = 'help-row'

    const label = document.createElement('span')
    label.className = 'help-label'
    label.textContent = KEYBIND_LABELS[action]

    const chordEl = document.createElement('kbd')
    chordEl.className = 'help-chord'
    chordEl.textContent =
      capturingAction === action ? 'Press keys…' : formatChord(keybinds[action])

    const editBtn = document.createElement('button')
    editBtn.type = 'button'
    editBtn.className = 'help-edit'
    editBtn.textContent = capturingAction === action ? 'Cancel' : 'Change'
    editBtn.addEventListener('click', () => {
      capturingAction = capturingAction === action ? null : action
      renderList()
    })

    row.append(label, chordEl, editBtn)
    list.appendChild(row)
  }
}

function handleCapture(event: KeyboardEvent): void {
  if (!capturingAction) return
  event.preventDefault()
  event.stopPropagation()

  if (event.key === 'Escape') {
    capturingAction = null
    renderList()
    return
  }

  if (['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) return

  const chord = chordFromKeyboardEvent(event)
  keybinds = { ...keybinds, [capturingAction]: chord }
  saveKeybinds(keybinds)
  capturingAction = null
  renderList()
  callbacks?.onKeybindsChange(keybinds)
}

export function getKeybinds(): KeybindMap {
  return keybinds
}

export function setKeybinds(map: KeybindMap): void {
  keybinds = map
  renderList()
}

export function initHelp(cb: HelpCallbacks): void {
  callbacks = cb

  btnClose.addEventListener('click', closeHelp)
  btnReset.addEventListener('click', () => {
    keybinds = resetKeybinds()
    renderList()
    callbacks?.onKeybindsChange(keybinds)
  })

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeHelp()
  })

  document.addEventListener('keydown', (event) => {
    if (capturingAction) {
      handleCapture(event)
      return
    }
    if (dialog.hidden) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeHelp()
    }
  })
}

export function openHelp(): void {
  keybinds = loadKeybinds()
  capturingAction = null
  renderList()
  backdrop.hidden = false
  dialog.hidden = false
  btnClose.focus()
}

export function closeHelp(): void {
  capturingAction = null
  backdrop.hidden = true
  dialog.hidden = true
  callbacks?.onClose()
}

export function isHelpOpen(): boolean {
  return !dialog.hidden
}

export function isCapturingKeybind(): boolean {
  return capturingAction !== null
}
