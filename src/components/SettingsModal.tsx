import React, { useState, useRef, useEffect } from 'react'

interface Props {
  onClose: () => void
}

const SECTIONS = ['Furigana', 'Text'] as const
type Section = (typeof SECTIONS)[number]

const SECTION_ICONS: Record<Section, React.ReactNode> = {
  Furigana: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v11.75A2.75 2.75 0 0 0 16.75 18h-12A2.75 2.75 0 0 1 2 15.25V3.5Zm3.75 7a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM5 5.75A.75.75 0 0 1 5.75 5h4.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 7.25v-1.5Z" clipRule="evenodd" />
    </svg>
  ),
  Text: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
    </svg>
  ),
}

const glassStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  backdropFilter: 'blur(16px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
}

/* ── Controls ─────────────────────────────────────────── */

function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="group flex items-start justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13px] text-[#c8c8c8] leading-tight">{label}</span>
        {desc && <span className="text-[11px] text-zinc-500 leading-tight">{desc}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0 mt-0.5"
        style={{
          backgroundColor: value ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.06)',
          boxShadow: value
            ? 'inset 0 1px 2px rgba(0,0,0,0.2), 0 0 8px rgba(96,165,250,0.15)'
            : 'inset 0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <span
          className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all duration-200"
          style={{
            transform: value ? 'translateX(18px)' : 'translateX(0)',
            backgroundColor: value ? '#e2e8f0' : '#71717a',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </label>
  )
}

function SliderInput({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.03] transition-colors">
      <span className="text-[13px] text-[#c8c8c8]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative w-28">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="settings-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(96,165,250,0.5) ${pct}%, rgba(255,255,255,0.06) ${pct}%)`,
            }}
          />
        </div>
        <span
          className="text-[11px] text-zinc-400 w-10 text-center font-mono rounded-md py-0.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          {value}{unit}
        </span>
      </div>
    </div>
  )
}

function Dropdown({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.03] transition-colors">
      <span className="text-[13px] text-[#c8c8c8]">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-[12px] rounded-lg px-2.5 py-1.5 text-[#c8c8c8] cursor-pointer transition-all"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {current?.label}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        {open && (
          <div
            className="absolute right-0 top-full mt-1 min-w-full rounded-lg py-1 z-10 overflow-hidden"
            style={{
              ...glassStyle,
              backgroundColor: 'rgba(30,30,30,0.95)',
            }}
          >
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`block w-full text-left text-[12px] px-3 py-1.5 transition-colors whitespace-nowrap ${
                  o.value === value
                    ? 'text-zinc-200 bg-white/[0.07]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{title}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

/* ── Sections ─────────────────────────────────────────── */

function FuriganaSection() {
  const [enabled, setEnabled] = useState(true)
  const [highlightedOnly, setHighlightedOnly] = useState(false)
  const [jlptOnly, setJlptOnly] = useState(false)
  const [hideProperNames, setHideProperNames] = useState(false)

  return (
    <div className="flex flex-col">
      <SectionHeader title="Display" />
      <Toggle
        label="Enable furigana"
        desc="Show reading annotations above kanji"
        value={enabled}
        onChange={setEnabled}
      />
      <div className="my-2 h-px bg-white/5" />
      <SectionHeader title="Filters" />
      <Toggle
        label="Highlighted words only"
        desc="Only show furigana for words you've highlighted"
        value={highlightedOnly}
        onChange={setHighlightedOnly}
      />
      <Toggle
        label="JLPT words only"
        desc="Restrict furigana to words in selected JLPT level"
        value={jlptOnly}
        onChange={setJlptOnly}
      />
      <Toggle
        label="Hide for proper names"
        desc="Skip furigana on names with honorific suffixes"
        value={hideProperNames}
        onChange={setHideProperNames}
      />
    </div>
  )
}

function TextSection() {
  const [fontFamily, setFontFamily] = useState('sans-serif')
  const [fontSize, setFontSize] = useState(16)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [tokenSpacing, setTokenSpacing] = useState(0)
  const [lineSpacing, setLineSpacing] = useState(8)
  const [removeWhitespace, setRemoveWhitespace] = useState(false)

  return (
    <div className="flex flex-col">
      <SectionHeader title="Typography" />
      <Dropdown
        label="Font family"
        value={fontFamily}
        onChange={setFontFamily}
        options={[
          { label: 'Sans-serif', value: 'sans-serif' },
          { label: 'Serif', value: 'serif' },
          { label: 'Monospace', value: 'monospace' },
          { label: 'System default', value: 'system-ui' },
        ]}
      />
      <SliderInput label="Font size" value={fontSize} onChange={setFontSize} min={10} max={40} unit="px" />
      <Toggle label="Bold" value={bold} onChange={setBold} />
      <Toggle label="Italic" value={italic} onChange={setItalic} />
      <div className="my-2 h-px bg-white/5" />
      <SectionHeader title="Spacing" />
      <SliderInput label="Token spacing" value={tokenSpacing} onChange={setTokenSpacing} min={0} max={16} unit="px" />
      <SliderInput label="Line spacing" value={lineSpacing} onChange={setLineSpacing} min={0} max={32} unit="px" />
      <div className="my-2 h-px bg-white/5" />
      <SectionHeader title="Processing" />
      <Toggle
        label="Remove whitespace"
        desc="Strip spaces between tokens for denser layout"
        value={removeWhitespace}
        onChange={setRemoveWhitespace}
      />
    </div>
  )
}

/* ── Modal ────────────────────────────────────────────── */

export default function SettingsModal({ onClose }: Props) {
  const [active, setActive] = useState<Section>('Furigana')
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setClosing(true)
    setVisible(false)
    setTimeout(onClose, 200)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !closing) handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closing])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        pointerEvents: closing ? 'none' : undefined,
      }}
      onClick={e => { if (e.target === e.currentTarget && !closing) handleClose() }}
    >
      <div
        ref={panelRef}
        className="flex flex-col rounded-2xl font-mono text-[#c8c8c8] overflow-hidden transition-all duration-200"
        style={{
          width: '80vw',
          height: '70vh',
          maxWidth: '800px',
          maxHeight: '560px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(8px)',
          ...glassStyle,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-[13px] font-medium tracking-wide text-zinc-300">Settings</span>
          <button
            onClick={handleClose}
            className="p-1 -mr-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[160px] shrink-0 border-r border-white/[0.06] py-3 px-2 flex flex-col gap-0.5">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`flex items-center gap-2.5 w-full text-left text-[13px] px-3 py-2 rounded-lg transition-all ${
                  s === active
                    ? 'text-zinc-200 bg-white/[0.07]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                }`}
              >
                <span className={s === active ? 'text-blue-400/70' : 'text-zinc-600'}>{SECTION_ICONS[s]}</span>
                {s}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {active === 'Furigana' && <FuriganaSection />}
            {active === 'Text' && <TextSection />}
          </div>
        </div>
      </div>
    </div>
  )
}
