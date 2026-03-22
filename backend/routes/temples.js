const express = require('express');
const path = require('path');
const router = express.Router();

let cachedTemples = null;
function getTemples() {
  if (!cachedTemples) cachedTemples = require(path.join(__dirname, '..', 'data', 'temples.json'));
  return cachedTemples;
}

function getSimulatedStatus(temple) {
  const now = new Date();
  const hour = now.getHours();
  let mO = 6, mC = 12, eO = 16, eC = 21;
  if (temple.timings?.morning) { mO = parseInt(temple.timings.morning.open) || mO; mC = parseInt(temple.timings.morning.close) || mC; }
  if (temple.timings?.evening) { eO = parseInt(temple.timings.evening.open) || eO; eC = parseInt(temple.timings.evening.close) || eC; }
  const isOpen = (hour >= mO && hour < mC) || (hour >= eO && hour < eC);
  const levels = ['low','medium','high','extreme'];
  let ri = hour >= 5 && hour <= 7 ? 2 : hour >= 8 && hour <= 10 ? 3 : hour >= 11 && hour <= 14 ? 1 : hour >= 17 && hour <= 19 ? 2 : hour >= 19 && hour <= 21 ? 3 : 0;
  ri = Math.min(3, Math.max(0, ri + (Math.random() > 0.7 ? 1 : 0)));
  const waits = ['15-30 min','30-60 min','1-3 hours','3-6 hours'];
  const base = temple.liveStatus?.currentFootfall || 5000;
  return { isOpen, rushLevel: levels[ri], estimatedWait: isOpen ? waits[ri] : 'Temple Closed',
    currentFootfall: isOpen ? Math.round(base * [0.3,0.6,0.85,1][ri] * (0.8 + Math.random()*0.4)) : 0,
    lastUpdated: now.toISOString() };
}

router.get('/categories', (req, res) => {
  const categories = [...new Set(getTemples().map(t => t.category).filter(Boolean))];
  res.json({ categories });
});

router.get('/', (req, res) => {
  const { search, state, category } = req.query;
  let results = getTemples().map(t => ({
    id: t.id, name: t.name, deity: t.deity, location: t.location, state: t.state,
    category: t.category, image: t.image, description: t.description?.substring(0, 150) + '...',
    highlights: t.highlights, latitude: t.latitude, longitude: t.longitude,
    liveStatus: getSimulatedStatus(t)
  }));
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(t => t.name?.toLowerCase().includes(q) || t.deity?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) || t.state?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q));
  }
  if (state) results = results.filter(t => t.state?.toLowerCase() === state.toLowerCase());
  if (category) results = results.filter(t => t.category?.toLowerCase() === category.toLowerCase());
  res.json({ temples: results, total: results.length });
});

router.get('/:id', (req, res) => {
  const temple = getTemples().find(t => t.id === req.params.id);
  if (!temple) return res.status(404).json({ error: 'Temple not found' });
  res.json({ ...temple, liveStatus: getSimulatedStatus(temple) });
});

router.get('/:id/status', (req, res) => {
  const temple = getTemples().find(t => t.id === req.params.id);
  if (!temple) return res.status(404).json({ error: 'Temple not found' });
  res.json({ templeId: temple.id, templeName: temple.name, ...getSimulatedStatus(temple) });
});

module.exports = router;
