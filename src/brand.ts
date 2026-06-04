const IDLE_MS = 1200

const brand = document.getElementById('brand')!
const brandCursor = document.getElementById('brand-cursor')!

let idleTimer: ReturnType<typeof setTimeout> | null = null

function setWriting(active: boolean): void {
  brand.classList.toggle('is-writing', active)
  brandCursor.textContent = active ? '_' : '.'
}

export function initBrandActivity(): void {
  setWriting(false)
}

export function noteWritingActivity(): void {
  setWriting(true)
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => setWriting(false), IDLE_MS)
}
