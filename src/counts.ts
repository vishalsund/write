export type TextCounts = {
  words: number
  chars: number
}

export function countText(text: string): TextCounts {
  const chars = text.length
  const trimmed = text.trim()
  if (!trimmed) {
    return { words: 0, chars }
  }
  const words = trimmed.split(/\s+/).length
  return { words, chars }
}

export function formatCounts(counts: TextCounts): string {
  const w = counts.words === 1 ? 'word' : 'words'
  const c = counts.chars === 1 ? 'char' : 'chars'
  return `${counts.words} ${w} · ${counts.chars} ${c}`
}
