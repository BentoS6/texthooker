import { Routes, Route, Link } from 'react-router-dom'
import ReadView from './pages/ReadView'
import HighlightsView from './pages/HighlightsView'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="flex gap-4 p-4 border-b border-gray-800">
        <Link to="/" className="hover:text-white">Read</Link>
        <Link to="/highlights" className="hover:text-white">Highlights</Link>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<ReadView />} />
          <Route path="/highlights" element={<HighlightsView />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
