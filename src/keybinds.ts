const STORAGE_KEY = 'write:keybinds'

export type KeybindAction =
  | 'save'
  | 'open'
  | 'bold'
  | 'italic'
  | 'undo'
  | 'redo'
  | 'bulletList'
  | 'orderedList'
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
  | 'help'

export type KeybindChord = string

export type KeybindMap = Record<KeybindAction, KeybindChord>

export const KEYBIND_LABELS: Record<KeybindAction, string> = {
  save: 'Save',
  open: 'Open file',
  bold: 'Bold',
  italic: 'Italic',
  undo: 'Undo',
  redo: 'Redo',
  bulletList: 'Bullet list',
  orderedList: 'Numbered list',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  heading4: 'Heading 4',
  heading5: 'Heading 5',
  heading6: 'Heading 6',
  paragraph: 'Paragraph',
  link: 'Insert link',
  code: 'Inline code',
  codeBlock: 'Code block',
  math: 'Insert math',
  help: 'Keyboard shortcuts',
}

export const DEFAULT_KEYBINDS: KeybindMap = {
  save: 'mod+s',
  open: 'mod+o',
  bold: 'mod+b',
  italic: 'mod+i',
  undo: 'mod+z',
  redo: 'mod+shift+z',
  bulletList: 'mod+shift+8',
  orderedList: 'mod+shift+7',
  heading1: 'mod+alt+1',
  heading2: 'mod+alt+2',
  heading3: 'mod+alt+3',
  heading4: 'mod+alt+4',
  heading5: 'mod+alt+5',
  heading6: 'mod+alt+6',
  paragraph: 'mod+alt+0',
  link: 'mod+k',
  code: 'mod+e',
  codeBlock: 'mod+alt+c',
  math: 'mod+alt+m',
  help: 'mod+/',
}

const ACTION_ORDER: KeybindAction[] = [
  'save',
  'open',
  'bold',
  'italic',
  'link',
  'code',
  'codeBlock',
  'math',
  'undo',
  'redo',
  'bulletList',
  'orderedList',
  'paragraph',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'heading6',
  'help',
]

export function getActionOrder(): KeybindAction[] {
  return ACTION_ORDER
}

function isValidChord(value: unknown): value is KeybindChord {
  return typeof value === 'string' && value.length > 0 && value.includes('+')
}

export function loadKeybinds(): KeybindMap {
  const map = { ...DEFAULT_KEYBINDS }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return map
  try {
    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>
    for (const action of ACTION_ORDER) {
      const chord = parsed[action]
      if (isValidChord(chord)) {
        map[action] = chord.toLowerCase()
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return map
}

export function saveKeybinds(map: KeybindMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function resetKeybinds(): KeybindMap {
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_KEYBINDS }
}

function normalizeKey(key: string): string {
  const lower = key.toLowerCase()
  if (lower === ' ') return 'space'
  if (lower === 'escape') return 'escape'
  if (lower === 'arrowup') return 'up'
  if (lower === 'arrowdown') return 'down'
  if (lower === 'arrowleft') return 'left'
  if (lower === 'arrowright') return 'right'
  return lower
}

/** Physical key for chords — Shift+8 becomes "8", not "*". */
function keyTokenFromEvent(event: KeyboardEvent): string {
  const { code } = event
  if (code.startsWith('Digit')) return code.slice(5).toLowerCase()
  if (code.startsWith('Key')) return code.slice(3).toLowerCase()
  if (code === 'Slash') return '/'
  if (code === 'Comma') return ','
  if (code === 'Period') return '.'
  return normalizeKey(event.key)
}

export function chordFromKeyboardEvent(event: KeyboardEvent): KeybindChord {
  const parts: string[] = []
  if (event.metaKey || event.ctrlKey) parts.push('mod')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')
  parts.push(keyTokenFromEvent(event))
  return parts.join('+')
}

export function eventMatchesChord(event: KeyboardEvent, chord: KeybindChord): boolean {
  return chordFromKeyboardEvent(event) === chord.toLowerCase()
}

export function findActionForEvent(
  event: KeyboardEvent,
  map: KeybindMap,
): KeybindAction | null {
  const pressed = chordFromKeyboardEvent(event)
  for (const action of ACTION_ORDER) {
    if (map[action].toLowerCase() === pressed) return action
  }
  return null
}

const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPod|iPad/i.test(navigator.platform)

export function formatChord(chord: KeybindChord): string {
  return chord
    .split('+')
    .map((part) => {
      switch (part) {
        case 'mod':
          return IS_MAC ? '⌘' : 'Ctrl'
        case 'alt':
          return IS_MAC ? '⌥' : 'Alt'
        case 'shift':
          return IS_MAC ? '⇧' : 'Shift'
        case 'space':
          return 'Space'
        default:
          if (part.length === 1) return part.toUpperCase()
          return part.charAt(0).toUpperCase() + part.slice(1)
      }
    })
    .join(IS_MAC ? '' : '+')
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}
