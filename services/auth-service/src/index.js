require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors'); 
const { connectDB, sequelize } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. MIDDLEWARE FIRST (The "Filter" Layer)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Needs to be before routes to parse the body!

const PORT = process.env.AUTH_PORT || 3001;

// 2. DATABASE CONNECTION
connectDB();

// 3. ROUTES LAST (The "Action" Layer)
app.use('/api/auth', authRoutes);

app.get('/api/auth/health', (req, res) => {
    res.json({ status: 'Auth Service Online' });
});

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('✨ Database Tables Synced');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Auth Service live on http://127.0.0.1:${PORT}`);
});