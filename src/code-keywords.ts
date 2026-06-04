/** Words that render in Cascadia cursive inside code. */
export const CODE_CURSIVE_KEYWORDS = new Set([
  'and',
  'as',
  'async',
  'await',
  'break',
  'case',
  'class',
  'const',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'enum',
  'except',
  'export',
  'extends',
  'false',
  'finally',
  'fn',
  'for',
  'from',
  'function',
  'if',
  'impl',
  'import',
  'in',
  'interface',
  'lambda',
  'let',
  'match',
  'new',
  'not',
  'null',
  'of',
  'or',
  'pass',
  'pub',
  'raise',
  'return',
  'struct',
  'switch',
  'trait',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'use',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

const WORD_RE = /\b[A-Za-z_][A-Za-z0-9_]*\b/g

export function isCodeCursiveKeyword(word: string): boolean {
  return CODE_CURSIVE_KEYWORDS.has(word.toLowerCase())
}

export function findKeywordMatches(text: string): { from: number; to: number }[] {
  const matches: { from: number; to: number }[] = []
  WORD_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = WORD_RE.exec(text)) !== null) {
    const word = match[0]
    if (!isCodeCursiveKeyword(word)) continue
    matches.push({ from: match.index, to: match.index + word.length })
  }
  return matches
}
