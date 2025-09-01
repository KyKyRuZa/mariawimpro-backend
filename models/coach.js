const { DataTypes } = require('sequelize');
const {sequelize} = require('../database');

const Coach = sequelize.define('Coach', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  merits: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Стаж работы в годах'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'coaches',
  timestamps: true,
  underscored: true // Для автоматического преобразования camelCase в snake_case
});

module.exports = Coach;