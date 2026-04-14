import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import type { Highlight } from '../db'

const COLORS = ['#facc15', '#fb923c', '#34d399', '#60a5fa', '#c084fc']

interface Props {
  selectionRect: { left: number; top: number; bottom: number }
  existing?: Highlight
  onSelect: (color: string, note: string) => void
  onRemove: () => void
  onDismiss: () => void
}

export default function HighlightTooltip({ selectionRect, existing, onSelect, onRemove, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [color, setColor] = useState(existing?.color ?? COLORS[0])
  const [note, setNote] = useState(existing?.note ?? '')
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const tooltipH = el.offsetHeight
    const tooltipW = el.offsetWidth
    const gap = 8
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Vertical: prefer below, flip above if no room
    let y = selectionRect.bottom + gap
    if (y + tooltipH > vh) {
      y = selectionRect.top - tooltipH - gap
    }
    // Clamp to viewport
    y = Math.max(gap, Math.min(y, vh - tooltipH - gap))

    // Horizontal: start at selection left, clamp to viewport
    let x = selectionRect.left
    x = Math.max(gap, Math.min(x, vw - tooltipW - gap))

    setPos({ x, y })
  }, [selectionRect])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onDismiss])

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [])

  useEffect(resizeTextarea, [note, resizeTextarea])

  return (
    <div
      ref={ref}
      className="fixed z-50 flex flex-col gap-2 p-2.5 rounded-xl font-mono text-[#c8c8c8] w-52"
      style={{
        left: pos.x,
        top: pos.y,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-4 h-4 rounded-full hover:scale-125 transition-transform"
            style={{
              backgroundColor: c,
              outline: c === color ? '2px solid #c8c8c8' : 'none',
              outlineOffset: '2px',
            }}
          />
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="note..."
        rows={1}
        className="text-xs rounded-lg px-2 py-1 resize-none overflow-hidden outline-none text-[#c8c8c8] placeholder-zinc-500"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelect(color, note)}
          className="flex-1 text-xs px-2 py-1 rounded-lg text-[#c8c8c8] hover:brightness-125"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {existing ? 'update' : 'highlight'}
        </button>
        {existing && (
          <button
            onClick={onRemove}
            className="text-xs px-2 py-1 rounded-lg text-zinc-500 hover:text-red-400"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            remove
          </button>
        )}
      </div>
    </div>
  )
}
