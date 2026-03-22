import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TEMPLES_DATA } from '../data/temples'

export default function Dashboard() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedTemples] = useState(['kedarnath', 'tirupati-balaji', 'vaishno-devi', 'golden-temple'])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-saffron flex items-center justify-center text-white text-2xl font-heading font-bold mx-auto mb-6">T</div>
          <h2 className="font-heading text-2xl font-bold text-parchment mb-2">Welcome to Temple Go</h2>
          <p className="text-parchment/50 text-sm mb-8">Sign in to save temples, track bookings, and get personalized recommendations</p>
          <button onClick={() => setIsLoggedIn(true)}
            className="w-full flex items-center justify-center gap-3 bg-white text-stone px-6 py-3 rounded-xl font-semibold text-sm hover:bg-parchment transition-all mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button onClick={() => setIsLoggedIn(true)}
            className="w-full flex items-center justify-center gap-3 bg-stone-light text-parchment px-6 py-3 rounded-xl font-semibold text-sm border border-gold/20 hover:bg-stone-lighter transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            Phone OTP Login
          </button>
          <p className="text-parchment/30 text-xs mt-6">By continuing, you agree to our Terms of Service</p>
        </motion.div>
      </div>
    )
  }

  const saved = TEMPLES_DATA.filter(t => savedTemples.includes(t.id))

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-parchment">Your <span className="gradient-text">Dashboard</span></h1>
            <p className="text-parchment/50 text-sm mt-1">Welcome back, Devotee</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-parchment/40 text-sm hover:text-parchment">Sign out</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Saved Temples', value: saved.length, color: 'text-saffron' },
            { label: 'Temples Visited', value: 2, color: 'text-green-400' },
            { label: 'Upcoming Trips', value: 1, color: 'text-gold' },
            { label: 'AI Queries', value: 7, color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <p className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-parchment/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Saved Temples */}
        <h2 className="font-heading text-xl font-semibold text-parchment mb-4">Saved Temples</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {saved.map(t => (
            <motion.div key={t.id} whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/temple/${t.id}`)}
              className="glass-card overflow-hidden cursor-pointer flex">
              <img src={t.image} alt={t.name} className="w-28 h-full object-cover" />
              <div className="p-4 flex-1">
                <h3 className="font-heading text-sm font-semibold text-parchment">{t.name}</h3>
                <p className="text-parchment/50 text-xs mb-2">{t.location}</p>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gold/10 text-gold">{t.category}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming */}
        <h2 className="font-heading text-xl font-semibold text-parchment mb-4">Upcoming Trip</h2>
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-gold">Char Dham Yatra</h3>
              <p className="text-parchment/50 text-sm mt-1">May 15 - May 22, 2026</p>
              <p className="text-parchment/40 text-xs mt-2">Badrinath → Kedarnath → Gangotri → Yamunotri</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/15 text-green-400">Confirmed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
