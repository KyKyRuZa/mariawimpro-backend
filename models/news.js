const { DataTypes } = require('sequelize');
const {sequelize} = require('../database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  extra: {
    type: DataTypes.TEXT,
    allowNull: true // Поле необязательное
  },
  promo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // По умолчанию новость не промо
  }
}, {
  tableName: 'news',
  timestamps: true,
  underscored: true
});

module.exports = News;