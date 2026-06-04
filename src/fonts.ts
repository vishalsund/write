/** Editor body families (footer control). */
export type FontFamily = 'sans' | 'serif' | 'mono'

/** Per-run override applied via toolbar (span mark). */
export type TextFontRole = 'sans' | 'serif' | 'mono' | 'cursive'

export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}

export const TEXT_FONT_STACKS: Record<TextFontRole, string> = {
  sans: FONT_STACKS.sans,
  serif: FONT_STACKS.serif,
  mono: FONT_STACKS.mono,
  cursive: '"Cascadia Code", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}

export const FONT_CODE =
  '"Cascadia Code", ui-monospace, "SF Mono", Menlo, Consolas, monospace'

export function applyFontCssVariables(): void {
  document.documentElement.style.setProperty('--font-code', FONT_CODE)
  document.documentElement.style.setProperty('--font-cursive', TEXT_FONT_STACKS.cursive)
}
