import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Explore' },
    { to: '/ai-assistant', label: 'AI Guide' },
    { to: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-gold/10" style={{borderRadius:0}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-saffron flex items-center justify-center text-white font-bold text-lg font-heading">T</div>
          <span className="text-xl font-heading font-bold gradient-text tracking-wide">Temple Go</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                location.pathname === l.to
                  ? 'bg-saffron/15 text-saffron'
                  : 'text-parchment/70 hover:text-parchment hover:bg-white/5'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5" id="mobile-menu-btn">
          <span className={`w-5 h-0.5 bg-parchment transition-all ${mobileOpen ? 'rotate-45 translate-y-1' : ''}`}/>
          <span className={`w-5 h-0.5 bg-parchment transition-all ${mobileOpen ? 'opacity-0' : ''}`}/>
          <span className={`w-5 h-0.5 bg-parchment transition-all ${mobileOpen ? '-rotate-45 -translate-y-1' : ''}`}/>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
            className="md:hidden overflow-hidden border-t border-gold/10">
            <div className="p-4 flex flex-col gap-1">
              {links.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === l.to ? 'bg-saffron/15 text-saffron' : 'text-parchment/70'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
