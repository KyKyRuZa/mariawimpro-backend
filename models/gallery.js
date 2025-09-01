const { DataTypes } = require('sequelize');
const {sequelize} = require('../database');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  coachId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'coach_id',
    references: {
      model: 'coaches', // имя таблицы тренеров
      key: 'id'
    }
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'photo_url'
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Порядок отображения фотографий'
  }
}, {
  tableName: 'gallery',
  timestamps: true,
  underscored: true
});

module.exports = Gallery;