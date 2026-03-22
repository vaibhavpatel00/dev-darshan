import { motion } from 'framer-motion'
import { getRushColor } from '../data/temples'

export function StatusBadge({ isOpen, rushLevel, size = 'sm' }) {
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs'
  const px = size === 'lg' ? 'px-3 py-1.5' : 'px-2 py-1'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 ${px} rounded-full ${textSize} font-semibold ${
        isOpen ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
      }`}>
        <span className={`${dotSize} rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'} status-dot`} />
        {isOpen ? 'Open' : 'Closed'}
      </span>
      {isOpen && rushLevel && (
        <span className={`inline-flex items-center gap-1.5 ${px} rounded-full ${textSize} font-semibold`}
          style={{ background: `${getRushColor(rushLevel)}20`, color: getRushColor(rushLevel) }}>
          <span className={`${dotSize} rounded-full status-dot`} style={{ background: getRushColor(rushLevel) }} />
          Rush: {rushLevel.charAt(0).toUpperCase() + rushLevel.slice(1)}
        </span>
      )}
    </div>
  )
}

export function TempleCard({ temple, onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onClick?.(temple)}
      className="glass-card overflow-hidden cursor-pointer group"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={temple.image} alt={temple.name} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone/90 via-stone/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge isOpen={temple.liveStatus?.isOpen} rushLevel={temple.liveStatus?.rushLevel} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-stone/70 text-gold border border-gold/20">
            {temple.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-parchment mb-1 line-clamp-1">{temple.name}</h3>
        <p className="text-parchment/50 text-sm mb-2">{temple.location}</p>
        <p className="text-parchment/60 text-xs line-clamp-2 mb-3">{temple.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(temple.highlights || []).slice(0, 2).map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-saffron/10 text-saffron/80">{h}</span>
            ))}
          </div>
          {temple.liveStatus?.estimatedWait && temple.liveStatus?.isOpen && (
            <span className="text-[10px] text-parchment/40">Wait: {temple.liveStatus.estimatedWait}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function TempleCardCompact({ temple, onClick }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.02 }} onClick={() => onClick?.(temple)}
      className="flex-shrink-0 w-64 glass-card overflow-hidden cursor-pointer group">
      <div className="relative h-32 overflow-hidden">
        <img src={temple.image} alt={temple.name} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone/90 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <StatusBadge isOpen={temple.liveStatus?.isOpen} rushLevel={temple.liveStatus?.rushLevel} />
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-heading text-sm font-semibold text-parchment line-clamp-1">{temple.name}</h4>
        <p className="text-parchment/50 text-xs">{temple.location}</p>
      </div>
    </motion.div>
  )
}

export function SearchBar({ value, onChange, onSearch, placeholder = "Search temples, deities, cities..." }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-parchment/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-stone/60 backdrop-blur-md border border-gold/20 rounded-xl text-parchment placeholder-parchment/30 focus:outline-none focus:border-saffron/50 focus:ring-2 focus:ring-saffron/20 text-base transition-all"
        id="search-bar" />
    </div>
  )
}

export function CategoryCard({ category, count, onClick, icon }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card-light p-4 cursor-pointer group hover:border-saffron/30 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-lg gradient-saffron flex items-center justify-center text-white text-lg font-heading font-bold">
          {icon || category?.name?.charAt(0)}
        </div>
        <span className="text-2xl font-heading font-bold text-gold">{count}</span>
      </div>
      <h3 className="font-heading text-sm font-semibold text-parchment mb-1">{category?.name}</h3>
      <p className="text-parchment/40 text-xs">{category?.desc}</p>
    </motion.div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-3 border-saffron/30 border-t-saffron rounded-full animate-spin" />
    </div>
  )
}
