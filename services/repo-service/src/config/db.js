const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 🔍 FORCE look at the .env in THIS folder specifically

console.log("--- 🔎 REPO-SERVICE DB DIAGNOSTICS ---");
console.log("Current Directory:", process.cwd());
console.log("Loading .env from:", path.join(__dirname, '../../.env'));
console.log("DB_NAME:", process.env.DB_NAME || "❌ NOT FOUND");
console.log("DB_USER:", process.env.DB_USER || "❌ NOT FOUND");
console.log("DB_PASS:", process.env.DB_PASSWORD ? "****" : "❌ EMPTY");
console.log("--------------------------------------");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: 5432, // Explicitly set the port
    logging: false,
  }
);

module.exports = sequelize;