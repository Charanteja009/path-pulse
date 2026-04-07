const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RepoChat = sequelize.define('RepoChat', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  repo_analysis_id: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
});

module.exports = RepoChat;  