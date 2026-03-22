import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { StatusBadge } from './SharedComponents'

const INDIA_CENTER = [22.5, 79.5]
const INDIA_ZOOM = 5

function createTempleIcon(rushLevel) {
  const color = rushLevel === 'extreme' || rushLevel === 'high' ? '#EF4444' :
                rushLevel === 'medium' ? '#F59E0B' : '#22C55E'
  return L.divIcon({
    className: 'temple-marker',
    html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#FF6B35,#C9A84C);border-radius:50% 50% 50% 4px;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(253,246,227,0.5);box-shadow:0 4px 12px rgba(0,0,0,0.4),0 0 0 3px ${color}40">
      <span style="transform:rotate(45deg);font-size:14px;color:white;font-weight:bold;font-family:'Playfair Display',serif">T</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

function FlyToHandler({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 10, { duration: 1.5 })
  }, [center, zoom, map])
  return null
}

export default function MapView({ temples = [], onTempleClick, flyTo, className = '' }) {
  const mapRef = useRef(null)

  const markers = useMemo(() => temples.filter(t => t.latitude && t.longitude).map(temple => ({
    temple,
    position: [temple.latitude, temple.longitude],
    icon: createTempleIcon(temple.liveStatus?.rushLevel || 'low'),
  })), [temples])

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gold/10 ${className}`}>
      <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} ref={mapRef}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true} zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {flyTo && <FlyToHandler center={flyTo.center} zoom={flyTo.zoom} />}
        {markers.map(({ temple, position, icon }) => (
          <Marker key={temple.id} position={position} icon={icon}
            eventHandlers={{ click: () => onTempleClick?.(temple) }}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <img src={temple.image} alt={temple.name}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#FDF6E3' }}>
                  {temple.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#FDF6E3aa', marginBottom: '6px' }}>{temple.location}</p>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: temple.liveStatus?.isOpen ? '#22C55E20' : '#EF444420',
                    color: temple.liveStatus?.isOpen ? '#22C55E' : '#EF4444' }}>
                    {temple.liveStatus?.isOpen ? 'Open' : 'Closed'}
                  </span>
                  {temple.liveStatus?.isOpen && (
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
                      background: '#F59E0B20', color: '#F59E0B' }}>
                      Wait: {temple.liveStatus?.estimatedWait}
                    </span>
                  )}
                </div>
                <button onClick={() => onTempleClick?.(temple)}
                  style={{ width: '100%', padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#FF6B35,#C9A84C)', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
