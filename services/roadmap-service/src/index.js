const express = require('express');
const { connectDB, sequelize } = require('./config/db'); // We'll create this next
const roadmapRoutes = require('./routes/roadmapRoutes');

const cors = require('cors'); 
const app = express();
const PORT = 5001;

app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// 1. Connect to PostgreSQL
connectDB();

// 2. Sync Tables (Creates 'roadmaps' table if it doesn't exist)
sequelize.sync()
  .then(() => console.log("📁 Database Tables Synced"))
  .catch(err => console.error("❌ Sync Error:", err));

// 3. Health Check
app.get('/api/roadmap/health', (req, res) => {
  res.json({ status: 'Online', service: 'Roadmap' });
});

// 4. Use the AI-Logic Routes
app.use('/api/roadmap', roadmapRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Roadmap Service live on port ${PORT}`);
});