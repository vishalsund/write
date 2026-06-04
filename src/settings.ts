import { FONT_STACKS, applyFontCssVariables, type FontFamily } from './fonts'

const FONT_FAMILY_KEY = 'write:font-family'
const FONT_SIZE_KEY = 'write:font-size'
const CODE_CURSIVE_KEY = 'write:code-cursive-keywords'

export type { FontFamily } from './fonts'

export function getStoredFontFamily(): FontFamily {
  const value = localStorage.getItem(FONT_FAMILY_KEY)
  if (value === 'cascadia') {
    localStorage.setItem(FONT_FAMILY_KEY, 'sans')
    return 'sans'
  }
  if (value === 'sans' || value === 'serif' || value === 'mono') return value
  return 'sans'
}

export function getStoredFontSize(): number {
  const value = Number(localStorage.getItem(FONT_SIZE_KEY))
  if (Number.isFinite(value) && value >= 12 && value <= 32) return value
  return 17
}

export function getCodeCursiveKeywordsEnabled(): boolean {
  const value = localStorage.getItem(CODE_CURSIVE_KEY)
  if (value === '0' || value === 'false') return false
  return true
}

export function setCodeCursiveKeywordsEnabled(enabled: boolean): void {
  localStorage.setItem(CODE_CURSIVE_KEY, enabled ? '1' : '0')
  document.documentElement.dataset.codeCursive = enabled ? 'on' : 'off'
}

export function applyEditorFont(family: FontFamily, sizePx: number): void {
  document.documentElement.style.setProperty(
    '--editor-font-family',
    FONT_STACKS[family],
  )
  document.documentElement.style.setProperty('--editor-font-size', `${sizePx}px`)
  localStorage.setItem(FONT_FAMILY_KEY, family)
  localStorage.setItem(FONT_SIZE_KEY, String(sizePx))
}

export function initEditorFont(): { family: FontFamily; size: number } {
  applyFontCssVariables()
  const family = getStoredFontFamily()
  const size = getStoredFontSize()
  applyEditorFont(family, size)
  setCodeCursiveKeywordsEnabled(getCodeCursiveKeywordsEnabled())
  return { family, size }
}
