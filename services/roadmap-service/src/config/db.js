const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../../.env' }); // Reaching the root .env

const sequelize = new Sequelize(
  'path_pulse_roadmaps', // Name for this specific service DB
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🐘 PostgreSQL Connected (Roadmap Service)');
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
};

module.exports = { sequelize, connectDB };