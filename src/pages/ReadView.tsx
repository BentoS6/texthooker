import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClipboardInserter } from '../hooks/useClipboardPoller'
import { useHighlights } from '../hooks/useHighlights'
import { useJlptLevel } from '../hooks/useJlptLevel'
import HighlightTooltip from '../components/HighlightTooltip'
import HighlightedLine from '../components/HighlightedLine'
import type { JlptLevel } from '../data/jlpt'

interface Selection {
  text: string
  context: string
  rect: { left: number; top: number; bottom: number }
}

function ReadView() {
  const { lines, clear, undo } = useClipboardInserter()
  const { highlightMap, addHighlight, removeHighlight } = useHighlights()
  const { level, setLevel, jlptWords } = useJlptLevel()
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [debugTokens, setDebugTokens] = useState(false)


  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    isAtBottomRef.current = docHeight - scrollY < 50
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
    }
  }, [lines])

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (!text || !sel?.rangeCount) {
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    // Find parent line for context
    const node = range.startContainer.parentElement
    const lineEl = node?.closest('[data-line]')
    const context = lineEl?.textContent ?? ''

    setSelection({
      text,
      context,
      rect: {
        left: rect.left,
        top: rect.top,
        bottom: rect.bottom,
      },
    })
  }, [])

  const handleColorSelect = useCallback(
    async (color: string, note: string) => {
      if (selection) {
        await addHighlight(selection.text, selection.context, color, note)
        setSelection(null)
        window.getSelection()?.removeAllRanges()
      }
    },
    [selection, addHighlight],
  )

  const handleRemove = useCallback(async () => {
    if (selection) {
      await removeHighlight(selection.text)
      setSelection(null)
      window.getSelection()?.removeAllRanges()
    }
  }, [selection, removeHighlight])

  const handleDismiss = useCallback(() => {
    setSelection(null)
  }, [])

  const charCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.text.length, 0),
    [lines],
  )

  const navRight = document.getElementById('nav-right')

  return (
    <div className="flex flex-col h-full text-[#c8c8c8]">
      {navRight && createPortal(
        <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
          <button
            onClick={() => setDebugTokens(prev => !prev)}
            className={`px-2 py-0.5 rounded text-xs ${debugTokens ? 'bg-zinc-600 text-zinc-200' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
          >
            Tokens
          </button>
          <select
            value={level ?? ''}
            onChange={e => setLevel(e.target.value ? Number(e.target.value) as JlptLevel : null)}
            className="bg-transparent text-zinc-500 outline-none cursor-pointer text-xs"
            style={{ border: '1px solid #333', borderRadius: '4px', padding: '1px 4px' }}
          >
            <option value="" className="bg-[#1e1e1e]">JLPT</option>
            <option value="5" className="bg-[#1e1e1e]">N5</option>
            <option value="4" className="bg-[#1e1e1e]">N4</option>
            <option value="3" className="bg-[#1e1e1e]">N3</option>
            <option value="2" className="bg-[#1e1e1e]">N2</option>
            <option value="1" className="bg-[#1e1e1e]">N1</option>
          </select>
          {lines.length > 0 && (
            <>
              <span>{charCount}/{lines.length}</span>
              <button
                onClick={undo}
                className="px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400"
              >
                Undo
              </button>
              <button
                onClick={clear}
                className="px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400"
              >
                Clear
              </button>
            </>
          )}
        </div>,
        navRight,
      )}

      <div className="flex-1 space-y-4" onMouseUp={handleMouseUp}>
        {lines.length === 0 ? (
          <p className="text-zinc-500">
            Copy text to clipboard — it will appear here automatically.
          </p>
        ) : (
          lines.map((line) => (
            <div key={line.id}>
              <p data-line className="text-xl leading-normal">
                <HighlightedLine text={line.text} highlightMap={highlightMap} jlptWords={jlptWords} />
              </p>
              {debugTokens && line.tokens && (
                <table className="mt-1 mb-2 text-xs font-mono text-zinc-500 border-collapse">
                  <thead>
                    <tr className="text-zinc-600">
                      <th className="pr-3 text-left">surface</th>
                      <th className="pr-3 text-left">baseForm</th>
                      <th className="pr-3 text-left">reading</th>
                      <th className="text-left">pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {line.tokens.map((t, i) => (
                      <tr key={i}>
                        <td className="pr-3">{t.surface}</td>
                        <td className="pr-3">{t.baseForm}</td>
                        <td className="pr-3">{t.reading}</td>
                        <td>{t.pos}{t.posDetail ? `/${t.posDetail}` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {selection && (
        <HighlightTooltip
          selectionRect={selection.rect}
          existing={highlightMap.get(selection.text)}
          onSelect={handleColorSelect}
          onRemove={handleRemove}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  )
}

export default ReadView
