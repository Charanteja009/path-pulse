const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Roadmap = sequelize.define('Roadmap', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    goal: { type: DataTypes.STRING, allowNull: false },
    roadmap_data: { type: DataTypes.JSONB, allowNull: false },
    // Use STRING here to match the VARCHAR we just added to Docker
    status: {
        type: DataTypes.STRING,
        defaultValue: 'discovery'
    },
    completed_steps: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Roadmap;