const STORAGE_KEY = 'write:theme'

export type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value === 'light' || value === 'dark') return value
  return null
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  document.dispatchEvent(new CustomEvent('write:theme-change', { detail: theme }))
}

export function toggleTheme(): Theme {
  const next: Theme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

export function initTheme(): Theme {
  const theme = getPreferredTheme()
  applyTheme(theme)
  return theme
}
