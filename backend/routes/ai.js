const express = require('express');
const router = express.Router();

router.post('/recommend', async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      response: "AI service is currently running in demo mode. Please add your ANTHROPIC_API_KEY to the backend .env file for full AI-powered recommendations. In the meantime, try searching for temples by deity (Shiva, Vishnu, Devi) or region (North, South India) using the search feature!",
      demo: true
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: "You are a knowledgeable Hindu pilgrimage guide. Help devotees find temples based on their interests. Be warm, respectful, and concise. Suggest temples with name, location, why recommended, and best time to visit.",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    res.json({ response: data.content?.[0]?.text || 'I could not generate a response. Please try again.' });
  } catch (err) {
    res.status(500).json({ response: 'AI service error. Please try again later.', error: err.message });
  }
});

router.post('/plan-trip', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      response: "AI Trip Planner is in demo mode. Add ANTHROPIC_API_KEY to backend .env for personalized itineraries.\n\nSample 5-Day Char Dham Itinerary:\n\nDay 1: Arrive Haridwar → Rishikesh\nDay 2: Drive to Yamunotri (darshan)\nDay 3: Drive to Gangotri (darshan)\nDay 4: Drive to Kedarnath base → Trek\nDay 5: Kedarnath darshan → Return\n\nEstimated cost: ₹25,000-40,000 per person (travel + stay + food)",
      demo: true
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: "You are an expert Indian temple trip planner. Create a structured day-by-day itinerary with temple visits, travel, stays, darshan timings, and costs. Be practical and detailed.",
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    res.json({ response: data.content?.[0]?.text || 'Could not generate itinerary. Please try again.' });
  } catch (err) {
    res.status(500).json({ response: 'AI service error. Please try again later.', error: err.message });
  }
});

module.exports = router;
