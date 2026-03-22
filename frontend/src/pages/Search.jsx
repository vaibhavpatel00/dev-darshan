import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TEMPLES_DATA } from '../data/temples'
import { SearchBar, TempleCard } from '../components/SharedComponents'
import MapView from '../components/MapView'

function getSimulatedStatus(temple) {
  const hour = new Date().getHours()
  const mo = temple.timings?.morning, ev = temple.timings?.evening
  const mOpen = parseInt(mo?.open) || 6, mClose = parseInt(mo?.close) || 12
  const eOpen = parseInt(ev?.open) || 16, eClose = parseInt(ev?.close) || 21
  const isOpen = (hour >= mOpen && hour < mClose) || (hour >= eOpen && hour < eClose)
  const levels = ['low','medium','high','extreme']
  let ri = hour >= 5 && hour <= 7 ? 2 : hour >= 8 && hour <= 10 ? 3 : hour >= 17 && hour <= 19 ? 2 : hour >= 19 ? 3 : hour >= 11 && hour <= 14 ? 1 : 0
  const waits = ['15-30 min','30-60 min','1-3 hours','3-6 hours']
  const base = temple.liveStatus?.currentFootfall || 5000
  return { isOpen, rushLevel: levels[ri], estimatedWait: isOpen ? waits[ri] : 'Temple Closed',
    currentFootfall: isOpen ? Math.round(base * [0.3,0.6,0.85,1][ri] * (0.8 + Math.random()*0.4)) : 0,
    lastUpdated: new Date().toISOString() }
}

export default function Search() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [state, setState] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [flyTo, setFlyTo] = useState(null)

  const temples = TEMPLES_DATA.map(t => ({ ...t, liveStatus: getSimulatedStatus(t) }))
  const categories = [...new Set(temples.map(t => t.category).filter(Boolean))].sort()
  const states = [...new Set(temples.map(t => t.state).filter(Boolean))].sort()

  let results = temples
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(t =>
      t.name.toLowerCase().includes(q) || t.deity?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) || t.state?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    )
  }
  if (category) results = results.filter(t => t.category?.toLowerCase().includes(category.toLowerCase()))
  if (state) results = results.filter(t => t.state === state)

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-parchment mb-6">
            Explore <span className="gradient-text">Temples</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1"><SearchBar value={search} onChange={setSearch} /></div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-4 py-3 bg-stone/60 border border-gold/20 rounded-xl text-parchment text-sm focus:outline-none focus:border-saffron/50">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={state} onChange={e => setState(e.target.value)}
              className="px-4 py-3 bg-stone/60 border border-gold/20 rounded-xl text-parchment text-sm focus:outline-none focus:border-saffron/50">
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowMap(!showMap)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                showMap ? 'bg-saffron/15 border-saffron/30 text-saffron' : 'bg-stone/60 border-gold/20 text-parchment/60'
              }`}>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </motion.div>

        <p className="text-parchment/40 text-sm mb-4">{results.length} temples found</p>

        <div className={`grid gap-6 ${showMap ? 'grid-cols-1 lg:grid-cols-2' : ''}`}>
          {showMap && (
            <div className="h-[500px] lg:sticky lg:top-24">
              <MapView temples={results} flyTo={flyTo}
                onTempleClick={t => navigate(`/temple/${t.id}`)} className="h-full" />
            </div>
          )}
          <div className={`grid gap-4 ${showMap ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {results.map((t, i) => (
              <TempleCard key={t.id} temple={t} index={i}
                onClick={() => navigate(`/temple/${t.id}`)} />
            ))}
            {results.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-parchment/40 text-lg">No temples found matching your search.</p>
                <button onClick={() => { setSearch(''); setCategory(''); setState('') }}
                  className="mt-4 text-saffron text-sm">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
