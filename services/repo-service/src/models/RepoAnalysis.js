const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RepoAnalysis = sequelize.define('RepoAnalysis', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  repo_url: { type: DataTypes.STRING, allowNull: false, unique: true },
  summary: { type: DataTypes.JSONB, allowNull: false }
});

module.exports = RepoAnalysis;