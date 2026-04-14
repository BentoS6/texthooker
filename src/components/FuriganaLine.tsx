import { useMemo } from 'react'
import { toFuriganaSegments } from '../lib/furigana'
import { JLPT_COLORS, type JlptLevel } from '../data/jlpt'
import type { Highlight } from '../db'
import type { Token } from '../types/token'

interface Props {
  tokens: Token[]
  highlightMap: Map<string, Highlight>
  jlptWords: Map<string, JlptLevel>
}

function FuriganaLine({ tokens, highlightMap, jlptWords }: Props) {
  const segments = useMemo(() => toFuriganaSegments(tokens), [tokens])

  const fullText = useMemo(
    () => segments.map(s => s.surface).join(''),
    [segments],
  )

  // Precompute start offset for each segment
  const offsets = useMemo(() => {
    const result: number[] = []
    let pos = 0
    for (const seg of segments) {
      result.push(pos)
      pos += seg.surface.length
    }
    return result
  }, [segments])

  return (
    <>
      {segments.map((seg, i) => {
        const token = tokens[i]
        const start = offsets[i]
        const end = start + seg.surface.length
        const style: React.CSSProperties = {}
        let matched = false

        // Highlight: match surface text against highlightMap by position
        for (const [word, hl] of highlightMap) {
          let idx = fullText.indexOf(word)
          while (idx !== -1) {
            if (idx < end && idx + word.length > start) {
              style.backgroundColor = hl.color + '40'
              matched = true
              break
            }
            idx = fullText.indexOf(word, idx + 1)
          }
          if (matched) break
        }

        // JLPT: match by token baseForm (dictionary form)
        const jlptLevel = jlptWords.get(token.baseForm)
        if (jlptLevel) {
          style.textDecorationLine = 'underline'
          style.textDecorationStyle = 'dotted'
          style.textDecorationColor = JLPT_COLORS[jlptLevel]
          style.textUnderlineOffset = '4px'
          matched = true
        }

        return seg.reading ? (
          <ruby key={i} className={matched ? 'rounded px-0.5' : undefined} style={matched ? style : undefined}>
            {seg.surface}
            <rp>(</rp>
            <rt>{seg.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i} className={matched ? 'rounded px-0.5' : undefined} style={matched ? style : undefined}>
            {seg.surface}
          </span>
        )
      })}
    </>
  )
}

export default FuriganaLine
