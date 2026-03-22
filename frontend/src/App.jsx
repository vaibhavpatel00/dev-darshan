import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TempleDetail from './pages/TempleDetail'
import Search from './pages/Search'
import AIAssistant from './pages/AIAssistant'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-parchment">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/temple/:id" element={<TempleDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
