import type { Token } from '../types/token'

/** Return concatenated surfaces of all tokens overlapping [startOffset, endOffset), or null if none. */
export function snapToTokens(tokens: Token[], startOffset: number, endOffset: number): string | null {
  const overlapping = tokens.filter(t => {
    const tEnd = t.start + t.surface.length
    return t.start < endOffset && tEnd > startOffset
  })

  if (overlapping.length === 0) return null

  overlapping.sort((a, b) => a.start - b.start)
  return overlapping.map(t => t.surface).join('')
}
