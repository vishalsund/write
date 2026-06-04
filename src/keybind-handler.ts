import type { Editor } from '@tiptap/core'
import {
  findActionForEvent,
  isTypingTarget,
  type KeybindAction,
  type KeybindMap,
} from './keybinds'

const GLOBAL_ACTIONS: KeybindAction[] = ['save', 'open', 'help']

export type KeybindExecutor = (action: KeybindAction, editor: Editor) => void

export type KeybindGuard = () => boolean

export function handleKeybindEvent(
  event: KeyboardEvent,
  editor: Editor,
  keybinds: KeybindMap,
  execute: KeybindExecutor,
  shouldIgnore: KeybindGuard,
): boolean {
  if (shouldIgnore()) return false

  const action = findActionForEvent(event, keybinds)
  if (!action) return false

  const target = event.target
  const inRestrictedField =
    isTypingTarget(target) &&
    !(target instanceof HTMLElement && target.isContentEditable)

  if (inRestrictedField && !GLOBAL_ACTIONS.includes(action)) return false

  event.preventDefault()
  event.stopPropagation()
  execute(action, editor)
  return true
}
