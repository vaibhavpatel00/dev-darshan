import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TEMPLES_DATA } from '../data/temples'

const SYSTEM_PROMPT_RECOMMEND = `You are a knowledgeable Hindu pilgrimage guide for the Temple Go platform. You help devotees find the perfect temples to visit based on their interests, deity preference, region, purpose and time available. Be warm, respectful, and informative. When suggesting temples, include the temple name, why it's recommended, best time to visit, and key highlights. Keep responses concise but helpful. You have knowledge of all major Indian temples.`

const SYSTEM_PROMPT_PLANNER = `You are an expert Indian temple trip planner for the Temple Go platform. Given user preferences (departure city, dates, budget, group size, interests), create a structured day-by-day itinerary. Include temple visits, travel suggestions, stay recommendations, darshan timing tips, and estimated costs. Format the itinerary clearly with each day as a section. Be practical and detailed.`

export default function AIAssistant() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('recommend')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste! I'm your temple guide. Tell me — what kind of temples interest you? Are you drawn to Shiva temples, Vishnu temples, Devi shrines, or something else? Which region of India are you considering?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tripForm, setTripForm] = useState({ from: '', dates: '', budget: '', people: '', interests: '' })
  const [tripResult, setTripResult] = useState('')
  const [tripLoading, setTripLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      // Fallback: provide smart local response
      const q = input.toLowerCase()
      let response = suggestTemples(q)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    }
    setLoading(false)
  }

  const planTrip = async () => {
    if (tripLoading) return
    setTripLoading(true)
    setTripResult('')
    const prompt = `Plan a temple trip: Departing from ${tripForm.from}, Dates: ${tripForm.dates}, Budget: ${tripForm.budget}, People: ${tripForm.people}, Interests: ${tripForm.interests}`
    try {
      const res = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setTripResult(data.response)
    } catch {
      setTripResult(generateLocalItinerary(tripForm))
    }
    setTripLoading(false)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-parchment mb-2">
            AI Temple <span className="gradient-text">Guide</span>
          </h1>
          <p className="text-parchment/50 text-sm mb-6">Powered by AI — your personal pilgrimage assistant</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'recommend', label: 'Temple Recommender' }, { id: 'planner', label: 'Trip Planner' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'gradient-saffron text-white' : 'glass-card-light text-parchment/60 hover:text-parchment'
              }`}>{tab.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'recommend' ? (
            <motion.div key="recommend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card overflow-hidden flex flex-col" style={{ height: '60vh' }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'gradient-saffron text-white rounded-br-md'
                          : 'bg-stone-light text-parchment/90 rounded-bl-md border border-gold/10'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-stone-light rounded-2xl rounded-bl-md px-4 py-3 border border-gold/10">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t border-gold/10 p-3 flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about temples, deities, regions..."
                    className="flex-1 px-4 py-3 bg-stone/60 border border-gold/20 rounded-xl text-parchment placeholder-parchment/30 text-sm focus:outline-none focus:border-saffron/50"
                    id="ai-chat-input" />
                  <button onClick={sendMessage} disabled={loading}
                    className="gradient-saffron px-6 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-50">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="planner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-6">
                <h3 className="font-heading text-xl font-semibold text-parchment mb-4">Plan Your Pilgrimage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { key: 'from', label: 'Departure City', placeholder: 'e.g. Mumbai' },
                    { key: 'dates', label: 'Travel Dates', placeholder: 'e.g. 5 days in December' },
                    { key: 'budget', label: 'Budget', placeholder: 'e.g. ₹30,000 per person' },
                    { key: 'people', label: 'Number of People', placeholder: 'e.g. 2 adults, 1 child' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-parchment/50 text-xs mb-1">{field.label}</label>
                      <input value={tripForm[field.key]}
                        onChange={e => setTripForm({ ...tripForm, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-stone/60 border border-gold/20 rounded-xl text-parchment placeholder-parchment/30 text-sm focus:outline-none focus:border-saffron/50" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-parchment/50 text-xs mb-1">Interests</label>
                    <input value={tripForm.interests}
                      onChange={e => setTripForm({ ...tripForm, interests: e.target.value })}
                      placeholder="e.g. Shiva temples, heritage, nature, photography"
                      className="w-full px-4 py-3 bg-stone/60 border border-gold/20 rounded-xl text-parchment placeholder-parchment/30 text-sm focus:outline-none focus:border-saffron/50" />
                  </div>
                </div>
                <button onClick={planTrip} disabled={tripLoading}
                  className="gradient-saffron px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50">
                  {tripLoading ? 'Planning...' : 'Generate Itinerary'}
                </button>
              </div>

              {tripResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 mt-6">
                  <h3 className="font-heading text-xl font-semibold gradient-text mb-4">Your Itinerary</h3>
                  <div className="text-parchment/80 text-sm leading-relaxed whitespace-pre-wrap">{tripResult}</div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function suggestTemples(query) {
  const q = query.toLowerCase()
  let filtered = TEMPLES_DATA
  if (q.includes('shiva') || q.includes('jyotirlinga')) filtered = filtered.filter(t => t.deity?.includes('Shiva'))
  else if (q.includes('vishnu') || q.includes('krishna')) filtered = filtered.filter(t => t.deity?.includes('Vishnu') || t.deity?.includes('Krishna') || t.deity?.includes('Venkateswara'))
  else if (q.includes('devi') || q.includes('goddess') || q.includes('shakti')) filtered = filtered.filter(t => t.category?.includes('Shakti') || t.deity?.includes('Goddess'))
  else if (q.includes('south')) filtered = filtered.filter(t => ['Tamil Nadu','Kerala','Andhra Pradesh','Telangana','Karnataka'].includes(t.state))
  else if (q.includes('north')) filtered = filtered.filter(t => ['Uttar Pradesh','Uttarakhand','Rajasthan','Jammu & Kashmir','Delhi','Punjab'].includes(t.state))

  const picks = filtered.slice(0, 4)
  if (picks.length === 0) return "I'd be happy to help! Could you tell me more about what you're looking for? For example:\n- Which deity interests you (Shiva, Vishnu, Devi)?\n- Any preferred region (North, South, West India)?\n- Purpose: pilgrimage, tourism, or spiritual retreat?"

  let response = `Based on your interests, here are my recommendations:\n\n`
  picks.forEach((t, i) => {
    response += `${i + 1}. **${t.name}** — ${t.location}\n`
    response += `   ${t.description?.substring(0, 120)}...\n`
    response += `   Highlights: ${(t.highlights || []).slice(0, 3).join(', ')}\n\n`
  })
  response += `Would you like more details about any of these? Or shall I refine the search based on travel dates or budget?`
  return response
}

function generateLocalItinerary(form) {
  const temples = TEMPLES_DATA.slice(0, 5)
  let itinerary = `=== Your Temple Pilgrimage Itinerary ===\n`
  itinerary += `From: ${form.from || 'Your City'} | Duration: ${form.dates || '5 days'}\n`
  itinerary += `Budget: ${form.budget || 'Flexible'} | Group: ${form.people || '2 people'}\n\n`
  temples.forEach((t, i) => {
    itinerary += `--- Day ${i + 1}: ${t.name} ---\n`
    itinerary += `Location: ${t.location}\n`
    itinerary += `Morning: Arrive and attend morning darshan (${t.timings?.morning?.open || '6:00'} AM)\n`
    itinerary += `Afternoon: Explore ${(t.highlights || []).slice(0, 2).join(' and ')}\n`
    itinerary += `Evening: Evening aarti (${t.timings?.evening?.open || '6:00'} PM)\n`
    itinerary += `Booking: ${t.bookingUrl || t.officialWebsite || 'Contact temple directly'}\n\n`
  })
  itinerary += `\nNote: This is a sample itinerary. Connect your Anthropic API key for personalized AI-powered planning.`
  return itinerary
}
