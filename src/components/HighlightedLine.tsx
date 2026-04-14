import type { Highlight } from '../db'
import { JLPT_COLORS, type JlptLevel } from '../data/jlpt'

interface Props {
  text: string
  highlightMap: Map<string, Highlight>
  jlptWords: Map<string, JlptLevel>
}

export default function HighlightedLine({ text, highlightMap, jlptWords }: Props) {
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
        if (!highlight && !jlptLevel) {
          return <span key={i}>{part}</span>
        }

        const style: React.CSSProperties = {}

        // Manual highlight → background
        if (highlight) {
          style.backgroundColor = highlight.color + '40'
        }

        // JLPT → dotted underline
        if (jlptLevel) {
          style.textDecorationLine = 'underline'
          style.textDecorationStyle = 'dotted'
          style.textDecorationColor = JLPT_COLORS[jlptLevel]
          style.textUnderlineOffset = '4px'
        }

        return (
          <span key={i} className="rounded px-0.5" style={style}>
            {part}
          </span>
        )
      })}
    </>
  )
}
