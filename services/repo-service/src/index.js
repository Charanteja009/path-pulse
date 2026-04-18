const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const repoRoutes = require('./routes/repoRoutes');

dotenv.config({ 
    path: path.join(__dirname, '../.env'),
    override: true 
});

const app = express();
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/repo', repoRoutes);

const PORT = process.env.PORT || 5002;

// Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => {
  console.log('🐘 PostgreSQL Connected (Repo Service)');
  console.log('📁 Database Tables Synced');
  app.listen(PORT, () => {
    console.log(`📍 Repo Service live on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database Connection Failed:', err.message);
});