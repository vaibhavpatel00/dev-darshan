import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TEMPLES_DATA, CATEGORIES } from '../data/temples'
import { SearchBar, TempleCardCompact, CategoryCard } from '../components/SharedComponents'
import MapView from '../components/MapView'

const HERO_BG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg'

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
  return {
    isOpen, rushLevel: levels[ri],
    estimatedWait: isOpen ? waits[ri] : 'Temple Closed',
    currentFootfall: isOpen ? Math.round(base * [0.3,0.6,0.85,1][ri] * (0.8 + Math.random()*0.4)) : 0,
    lastUpdated: new Date().toISOString()
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [temples, setTemples] = useState([])
  const [flyTo, setFlyTo] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const enriched = TEMPLES_DATA.map(t => ({ ...t, liveStatus: getSimulatedStatus(t) }))
    setTemples(enriched)
    const interval = setInterval(() => {
      setTemples(prev => prev.map(t => ({ ...t, liveStatus: getSimulatedStatus(t) })))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredTemples = search
    ? temples.filter(t => {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || t.deity?.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q) || t.state?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      })
    : temples

  const featuredTemples = temples.filter(t =>
    ['kedarnath','tirupati-balaji','kashi-vishwanath','golden-temple','vaishno-devi',
     'ayodhya-ram-mandir','somnath','meenakshi-amman','jagannath-puri','akshardham'].includes(t.id)
  )

  const handleTempleClick = (temple) => navigate(`/temple/${temple.id}`)
  const handleMapTempleClick = (temple) => {
    setFlyTo({ center: [temple.latitude, temple.longitude], zoom: 12 })
  }
  const handleCategoryClick = (catId) => navigate(`/search?category=${catId}`)

  const catIcons = { 'jyotirlinga': 'J', 'char-dham': 'C', 'shakti-peeth': 'S', 'divya-desam': 'D', 'major-shrine': 'M', 'pancha-bhoota': 'P' }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Kedarnath Temple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/40 to-surface" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-gold/80 text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            Discover Sacred India
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-parchment mb-4 leading-tight">
            Find Your{' '}
            <span className="gradient-text">Divine Journey</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-parchment/60 text-lg mb-8 max-w-xl mx-auto">
            Explore 39+ temples across India with live status, darshan booking, and AI-powered trip planning
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xl mx-auto">
            <SearchBar value={search} onChange={setSearch}
              onSearch={() => search && navigate(`/search?q=${encodeURIComponent(search)}`)}
              placeholder="Search temples, deities, cities..." />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-parchment/30 flex items-start justify-center p-2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-saffron" />
          </div>
        </motion.div>
      </section>

      {/* Split Layout: Map + Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Map */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-heading text-2xl font-bold text-parchment mb-4">
              <span className="gradient-text">Live</span> Temple Map
            </h2>
            <div className="h-[450px]">
              <MapView temples={filteredTemples} onTempleClick={handleTempleClick}
                flyTo={flyTo} className="h-full" />
            </div>
          </motion.div>

          {/* Right: Category Cards */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-heading text-2xl font-bold text-parchment mb-4">
              Temple <span className="gradient-text">Collections</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} category={cat} count={cat.count}
                  onClick={() => handleCategoryClick(cat.id)} icon={catIcons[cat.id]} />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 glass-card-light p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-heading font-bold text-saffron">{temples.length}</p>
                  <p className="text-xs text-parchment/50">Temples</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-gold">
                    {temples.filter(t => t.liveStatus?.isOpen).length}
                  </p>
                  <p className="text-xs text-parchment/50">Open Now</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-green-400">
                    {[...new Set(temples.map(t => t.state))].length}
                  </p>
                  <p className="text-xs text-parchment/50">States</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Temples Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl font-bold text-parchment">
            Featured <span className="gradient-text">Temples</span>
          </h2>
          <button onClick={() => navigate('/search')}
            className="text-sm text-saffron hover:text-saffron-light transition-colors">
            View all →
          </button>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {featuredTemples.map(t => (
            <TempleCardCompact key={t.id} temple={t} onClick={handleTempleClick} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-saffron flex items-center justify-center text-white font-bold text-sm font-heading">T</div>
              <span className="font-heading font-bold gradient-text">Temple Go</span>
            </div>
            <p className="text-parchment/30 text-sm text-center">
              Connecting devotees with divine destinations across India
            </p>
            <p className="text-parchment/20 text-xs">Built with reverence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
