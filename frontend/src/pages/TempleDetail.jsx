import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TEMPLES_DATA } from '../data/temples'
import { StatusBadge } from '../components/SharedComponents'
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

export default function TempleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [temple, setTemple] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const t = TEMPLES_DATA.find(t => t.id === id)
    if (t) setTemple({ ...t, liveStatus: getSimulatedStatus(t) })
    window.scrollTo(0, 0)
  }, [id])

  if (!temple) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-parchment mb-4">Temple not found</h2>
        <button onClick={() => navigate('/')} className="gradient-saffron px-6 py-2 rounded-lg text-white">Go Home</button>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'darshan', label: 'Darshan & Booking' },
    { id: 'timings', label: 'Timings' },
    { id: 'nearby', label: 'Nearby' },
  ]

  const nearby = TEMPLES_DATA.filter(t => t.id !== temple.id && t.state === temple.state).slice(0, 4)

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Image */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img src={temple.image} alt={temple.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="text-parchment/60 hover:text-parchment text-sm mb-3 inline-flex items-center gap-1">
              ← Back
            </button>
            <StatusBadge isOpen={temple.liveStatus?.isOpen} rushLevel={temple.liveStatus?.rushLevel} size="lg" />
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-parchment mt-2">{temple.name}</h1>
            <p className="text-parchment/50 mt-1">{temple.location}</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-y border-gold/10 bg-stone/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-6 text-sm">
          <div><span className="text-parchment/40">Deity: </span><span className="text-parchment">{temple.deity}</span></div>
          <div><span className="text-parchment/40">Category: </span><span className="text-gold">{temple.category}</span></div>
          {temple.liveStatus?.isOpen && (
            <div><span className="text-parchment/40">Wait: </span><span className="text-saffron">{temple.liveStatus.estimatedWait}</span></div>
          )}
          {temple.liveStatus?.lastUpdated && (
            <div className="text-parchment/30 text-xs ml-auto">Updated {new Date(temple.liveStatus.lastUpdated).toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-saffron/15 text-saffron' : 'text-parchment/50 hover:text-parchment hover:bg-white/5'
              }`}>{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-heading text-xl font-semibold text-parchment mb-3">About</h3>
                  <p className="text-parchment/70 leading-relaxed">{temple.description}</p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-heading text-lg font-semibold text-parchment mb-3">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {(temple.highlights || []).map((h, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-saffron/10 text-saffron border border-saffron/20">{h}</span>
                    ))}
                  </div>
                </div>
                {temple.festivals && (
                  <div className="glass-card p-6">
                    <h3 className="font-heading text-lg font-semibold text-parchment mb-3">Festivals</h3>
                    <div className="flex flex-wrap gap-2">
                      {temple.festivals.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-gold/10 text-gold border border-gold/20">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                {temple.latitude && (
                  <div className="h-64 mb-4">
                    <MapView temples={[temple]} flyTo={{ center: [temple.latitude, temple.longitude], zoom: 11 }} className="h-full" />
                  </div>
                )}
                <a href={temple.bookingUrl || temple.officialWebsite} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center gradient-saffron text-white py-3 rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-saffron/20 transition-all">
                  Book Darshan Tickets
                </a>
              </div>
            </div>
          )}

          {activeTab === 'darshan' && (
            <div className="space-y-4">
              <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10">
                      <th className="text-left p-4 text-parchment/50 font-medium">Type</th>
                      <th className="text-left p-4 text-parchment/50 font-medium">Price</th>
                      <th className="text-left p-4 text-parchment/50 font-medium">Wait Time</th>
                      <th className="text-left p-4 text-parchment/50 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(temple.darshanTypes || []).map((d, i) => (
                      <tr key={i} className="border-b border-gold/5 hover:bg-white/3">
                        <td className="p-4">
                          <p className="text-parchment font-medium">{d.name}</p>
                          {d.description && <p className="text-parchment/40 text-xs mt-0.5">{d.description}</p>}
                        </td>
                        <td className="p-4 text-gold font-semibold">{d.price === 0 ? 'Free' : `₹${d.price}`}</td>
                        <td className="p-4 text-parchment/70">{d.waitTime}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${d.available !== false ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {d.available !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a href={temple.bookingUrl || temple.officialWebsite} target="_blank" rel="noopener noreferrer"
                className="inline-block gradient-saffron text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-saffron/20 transition-all">
                Book on Official Website →
              </a>
            </div>
          )}

          {activeTab === 'timings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {temple.timings?.morning && (
                <div className="glass-card p-5">
                  <h4 className="font-heading text-lg font-semibold text-gold mb-2">Morning Session</h4>
                  <p className="text-parchment text-2xl font-heading">{temple.timings.morning.open} — {temple.timings.morning.close}</p>
                </div>
              )}
              {temple.timings?.evening && (
                <div className="glass-card p-5">
                  <h4 className="font-heading text-lg font-semibold text-gold mb-2">Evening Session</h4>
                  <p className="text-parchment text-2xl font-heading">{temple.timings.evening.open} — {temple.timings.evening.close}</p>
                </div>
              )}
              {temple.timings?.special && (
                <div className="glass-card p-5 sm:col-span-2">
                  <h4 className="font-heading text-lg font-semibold text-saffron mb-2">Special</h4>
                  <p className="text-parchment/70">{temple.timings.special}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearby.map(t => (
                <motion.div key={t.id} whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/temple/${t.id}`)}
                  className="glass-card overflow-hidden cursor-pointer flex">
                  <img src={t.image} alt={t.name} className="w-24 h-24 object-cover" />
                  <div className="p-3 flex-1">
                    <h4 className="font-heading text-sm font-semibold text-parchment">{t.name}</h4>
                    <p className="text-parchment/50 text-xs">{t.location}</p>
                    <p className="text-gold text-xs mt-1">{t.category}</p>
                  </div>
                </motion.div>
              ))}
              {nearby.length === 0 && <p className="text-parchment/40 text-sm">No nearby temples in the same state.</p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
