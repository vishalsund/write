const FONT_FAMILY_KEY = 'write:font-family'
const FONT_SIZE_KEY = 'write:font-size'

export type FontFamily = 'sans' | 'serif' | 'mono'

const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}

export function getStoredFontFamily(): FontFamily {
  const value = localStorage.getItem(FONT_FAMILY_KEY)
  if (value === 'sans' || value === 'serif' || value === 'mono') return value
  return 'sans'
}

export function getStoredFontSize(): number {
  const value = Number(localStorage.getItem(FONT_SIZE_KEY))
  if (Number.isFinite(value) && value >= 12 && value <= 32) return value
  return 17
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
  const family = getStoredFontFamily()
  const size = getStoredFontSize()
  applyEditorFont(family, size)
  return { family, size }
}
