import type { Highlight } from '../db'
import type { Token } from '../types/token'
import { JLPT_COLORS, type JlptLevel } from '../data/jlpt'

interface Props {
  text: string
  highlightMap: Map<string, Highlight>
  jlptWords: Map<string, JlptLevel>
  tokens?: Token[]
}

/** Build map from character offset → JLPT level using token baseForm lookups */
function buildJlptSpans(tokens: Token[], jlptWords: Map<string, JlptLevel>): Map<number, JlptLevel> {
  const spans = new Map<number, JlptLevel>()
  for (const t of tokens) {
    const level = jlptWords.get(t.baseForm)
    if (level) {
      for (let j = t.start; j < t.start + t.surface.length; j++) {
        spans.set(j, level)
      }
    }
  }
  return spans
}

export default function HighlightedLine({ text, highlightMap, jlptWords, tokens }: Props) {
  // Build highlight regex from manual highlights (surface match)
  const highlightWords = [...highlightMap.keys()]
  let highlightRegex: RegExp | null = null
  if (highlightWords.length > 0) {
    const sorted = highlightWords.sort((a, b) => b.length - a.length)
    const escaped = sorted.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    highlightRegex = new RegExp(`(${escaped.join('|')})`, 'g')
  }

  // JLPT: if tokens available, use baseForm lookup; otherwise fall back to surface match
  const jlptSpans = tokens ? buildJlptSpans(tokens, jlptWords) : null

  // If no tokens, fall back to old regex approach for JLPT too
  if (!jlptSpans && !highlightRegex) {
    // Old path: regex match both highlight + jlpt surface words
    const allWords = new Set([...highlightMap.keys(), ...jlptWords.keys()])
    if (allWords.size === 0) return <>{text}</>

    const sorted = [...allWords].sort((a, b) => b.length - a.length)
    const escaped = sorted.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const regex = new RegExp(`(${escaped.join('|')})`, 'g')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) => {
          const highlight = highlightMap.get(part)
          const jlptLevel = jlptWords.get(part)
          if (!highlight && !jlptLevel) return <span key={i}>{part}</span>
          const style: React.CSSProperties = {}
          if (highlight) style.backgroundColor = highlight.color + '40'
          if (jlptLevel) {
            style.textDecorationLine = 'underline'
            style.textDecorationStyle = 'dotted'
            style.textDecorationColor = JLPT_COLORS[jlptLevel]
            style.textUnderlineOffset = '4px'
          }
          return <span key={i} className="rounded px-0.5" style={style}>{part}</span>
        })}
      </>
    )
  }

  // Token-aware path: render character by character in styled runs
  // Build per-character style info
  const chars: { char: string; highlight?: Highlight; jlptLevel?: JlptLevel }[] = []
  for (let ci = 0; ci < text.length; ci++) {
    chars.push({
      char: text[ci],
      jlptLevel: jlptSpans?.get(ci),
    })
  }

  // Apply highlight spans (surface match by position)
  if (highlightRegex) {
    let match: RegExpExecArray | null
    while ((match = highlightRegex.exec(text)) !== null) {
      const hl = highlightMap.get(match[0])
      if (hl) {
        for (let j = match.index; j < match.index + match[0].length; j++) {
          chars[j].highlight = hl
        }
      }
    }
  }

  // Group consecutive chars with same styling into runs
  const runs: { text: string; highlight?: Highlight; jlptLevel?: JlptLevel }[] = []
  for (const c of chars) {
    const prev = runs[runs.length - 1]
    if (prev && prev.highlight === c.highlight && prev.jlptLevel === c.jlptLevel) {
      prev.text += c.char
    } else {
      runs.push({ text: c.char, highlight: c.highlight, jlptLevel: c.jlptLevel })
    }
  }

  return (
    <>
      {runs.map((run, i) => {
        if (!run.highlight && !run.jlptLevel) {
          return <span key={i}>{run.text}</span>
        }
        const style: React.CSSProperties = {}
        if (run.highlight) style.backgroundColor = run.highlight.color + '40'
        if (run.jlptLevel) {
          style.textDecorationLine = 'underline'
          style.textDecorationStyle = 'dotted'
          style.textDecorationColor = JLPT_COLORS[run.jlptLevel]
          style.textUnderlineOffset = '4px'
        }
        return <span key={i} className="rounded px-0.5" style={style}>{run.text}</span>
      })}
    </>
  )
}
