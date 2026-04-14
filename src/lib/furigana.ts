import type { Token } from '../types/token'

export interface FuriganaSegment {
  surface: string
  reading: string | null
}

const KANJI_RE = /[\u4e00-\u9faf\u3400-\u4dbf]/

export function hasKanji(text: string): boolean {
  return KANJI_RE.test(text)
}

export function katakanaToHiragana(kata: string): string {
  return kata.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  )
}

export function toFuriganaSegments(tokens: Token[]): FuriganaSegment[] {
  return tokens.map((t) => ({
    surface: t.surface,
    reading: hasKanji(t.surface) ? katakanaToHiragana(t.reading) : null,
  }))
}
