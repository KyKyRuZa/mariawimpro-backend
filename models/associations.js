const Coach = require('./coach');
const Gallery = require('./gallery');

// Один тренер имеет много фотографий в галерее
Coach.hasMany(Gallery, {
  foreignKey: 'coach_id',
  as: 'gallery',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Каждая фотография принадлежит одному тренеру
Gallery.belongsTo(Coach, {
  foreignKey: 'coach_id',
  as: 'coach',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = {
  Coach,
  Gallery
};