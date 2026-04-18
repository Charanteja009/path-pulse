const { Sequelize } = require('sequelize');

// Use environment variables from our root .env (injected by Docker)
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST, // This points to 'postgres-db' in Docker
    dialect: 'postgres',
    logging: false, // Prevents SQL logs from cluttering your terminal
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully to Auth Service');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    // If the DB is down, we want the service to stop so we can fix it
    process.exit(1); 
  }
};

module.exports = { sequelize, connectDB };