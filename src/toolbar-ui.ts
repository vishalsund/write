import { icons } from './icons'
import type { KeybindAction, KeybindMap } from './keybinds'
import { formatChord } from './keybinds'

type IconName = keyof typeof icons

export function mountToolbarIcons(): void {
  document.querySelectorAll<HTMLElement>('[data-icon]').forEach((slot) => {
    const name = slot.dataset.icon as IconName
    if (icons[name]) slot.innerHTML = icons[name]
  })

  const helpSlot = document.getElementById('btn-help-icon')
  if (helpSlot) helpSlot.innerHTML = icons.keyboard

  updateThemeIcon()
}

export function updateThemeIcon(): void {
  const slot = document.getElementById('theme-icon-slot')
  if (!slot) return
  const isDark = document.documentElement.dataset.theme === 'dark'
  slot.innerHTML = isDark ? icons.sun : icons.moon
}

const CMD_KEYBINDS: Partial<Record<string, KeybindAction>> = {
  bold: 'bold',
  italic: 'italic',
  link: 'link',
  code: 'code',
  codeBlock: 'codeBlock',
  math: 'math',
  bulletList: 'bulletList',
  orderedList: 'orderedList',
  undo: 'undo',
  redo: 'redo',
}

export function updateToolbarTitles(keybinds: KeybindMap): void {
  document.querySelectorAll<HTMLButtonElement>('.btn-tool').forEach((btn) => {
    const label = btn.dataset.label
    if (!label) return

    const action = btn.dataset.cmd ? CMD_KEYBINDS[btn.dataset.cmd] : undefined
    const chord = action ? formatChord(keybinds[action]) : null
    btn.title = chord ? `${label} (${chord})` : label
  })

  const headingSelect = document.getElementById('heading-select')
  if (headingSelect) headingSelect.title = 'Block style'

  const imageBtn = document.getElementById('btn-image')
  if (imageBtn) imageBtn.title = 'Insert image'

  const helpBtn = document.getElementById('btn-help')
  if (helpBtn) {
    helpBtn.title = `Keyboard shortcuts (${formatChord(keybinds.help)})`
  }
}
