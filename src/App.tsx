import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ReadView from './pages/ReadView'
import HighlightsView from './pages/HighlightsView'
import TokenizerDiag from './pages/TokenizerDiag'
import SettingsModal from './components/SettingsModal'
import { ClipboardContext, useClipboardInserterProvider } from './hooks/useClipboardPoller'

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.295a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.295 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.295A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.22l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
    </svg>
  )
}

const NAV_LINKS = [
  { to: '/', label: 'Read' },
  { to: '/highlights', label: 'Highlights' },
] as const

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`text-[13px] font-mono px-2.5 py-1 rounded-md transition-all ${
        active
          ? 'text-zinc-200 bg-white/[0.07]'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
      }`}
    >
      {label}
    </Link>
  )
}

function App() {
  const clipboard = useClipboardInserterProvider()
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()

  return (
    <ClipboardContext.Provider value={clipboard}>
      <div className="min-h-screen bg-[#1e1e1e] text-[#c8c8c8] flex flex-col">
        <nav
          className="sticky top-0 z-10 flex items-center px-4 py-2 border-b border-white/[0.06]"
          style={{
            backgroundColor: 'rgba(30,30,30,0.85)',
            backdropFilter: 'blur(12px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
          }}
        >
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                label={link.label}
                active={location.pathname === link.to}
              />
            ))}
          </div>
          <div id="nav-right" className="ml-auto" />
        </nav>
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<ReadView />} />
            <Route path="/highlights" element={<HighlightsView />} />
            <Route path="/diag" element={<TokenizerDiag />} />
          </Routes>
        </main>
        <button
          onClick={() => setShowSettings(true)}
          className="group fixed bottom-4 right-4 p-2 text-zinc-400 hover:text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
        >
          <span className="block transition-transform duration-300 ease-out group-hover:rotate-90">
            <GearIcon />
          </span>
        </button>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    </ClipboardContext.Provider>
  )
}

export default App
