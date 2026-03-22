const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/temples', require('./routes/temples'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Temple Go API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\nTemple Go API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health\n`);
});
