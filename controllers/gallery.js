const Gallery = require('../models/gallery');
const Coach = require('../models/coach');
const path = require('path');
const fs = require('fs');

const uploadPath = '/var/www/assets';

const getBaseUrl = (req) => {
  return process.env.NODE_ENV === 'production' 
    ? 'https://mariaswimpro.ru'  // HTTPS для продакшена
    : `${req.protocol}://${req.get('host')}`; // Для разработки
};

const getGalleryByCoachId = async (req, res) => {
  try {
    const { coachId } = req.params;

    const coach = await Coach.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Тренер не найден'
      });
    }

    const gallery = await Gallery.findAll({
      where: { coachId },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      include: [{
        model: Coach,
        as: 'coach',
        attributes: ['id', 'fullName']
      }]
    });

    const baseUrl = getBaseUrl(req);
    
    const galleryWithUrls = gallery.map(item => {
      const galleryData = item.toJSON();
      if (galleryData.photoUrl) {
        galleryData.fullPhotoUrl = `${baseUrl}/assets/${galleryData.photoUrl}`;
      }
      return galleryData;
    });

    res.json({
      success: true,
      data: galleryWithUrls
    });
  } catch (error) {
    console.error('Ошибка при получении галереи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении галереи'
    });
  }
};


const getGalleryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await Gallery.findByPk(id, {
      include: [{
        model: Coach,
        as: 'coach',
        attributes: ['id', 'fullName']
      }]
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }

    const baseUrl = getBaseUrl(req);
    const galleryData = galleryItem.toJSON();
    
    if (galleryData.photoUrl) {
      galleryData.fullPhotoUrl = `${baseUrl}/assets/${galleryData.photoUrl}`;
    }

    res.json({
      success: true,
      data: galleryData
    });
  } catch (error) {
    console.error('Ошибка при получении фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении фотографии'
    });
  }
};

const addToGallery = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { caption, order = 0 } = req.body;

    const coach = await Coach.findByPk(coachId);
    if (!coach) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Тренер не найден'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение обязательно для загрузки'
      });
    }

    const newGalleryItem = await Gallery.create({
      coachId,
      photoUrl: req.file.filename,
      caption: caption || null,
      order: parseInt(order) || 0
    });

    const baseUrl = getBaseUrl(req);
    const galleryData = newGalleryItem.toJSON();
    galleryData.fullPhotoUrl = `${baseUrl}/assets/${galleryData.photoUrl}`;

    res.status(201).json({
      success: true,
      message: 'Фотография успешно добавлена в галерею',
      data: galleryData
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Ошибка при добавлении фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при добавлении фотографии'
    });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, order } = req.body;

    const galleryItem = await Gallery.findByPk(id);

    if (!galleryItem) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }

    let updateData = {};
    
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = parseInt(order);

    if (req.file) {
      if (galleryItem.photoUrl) {
        const oldImagePath = path.join(uploadPath, galleryItem.photoUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.photoUrl = req.file.filename;
    }

    await galleryItem.update(updateData);

    const baseUrl = getBaseUrl(req);
    const galleryData = galleryItem.toJSON();
    galleryData.fullPhotoUrl = `${baseUrl}/assets/${galleryData.photoUrl}`;

    res.json({
      success: true,
      message: 'Фотография успешно обновлена',
      data: galleryData
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Ошибка при обновлении фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении фотографии'
    });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await Gallery.findByPk(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }

    if (galleryItem.photoUrl) {
      const imagePath = path.join(uploadPath, galleryItem.photoUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await galleryItem.destroy();

    res.json({
      success: true,
      message: 'Фотография успешно удалена из галереи'
    });
  } catch (error) {
    console.error('Ошибка при удалении фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении фотографии'
    });
  }
};

const updateGalleryOrder = async (req, res) => {
  try {
    const { items } = req.body; // Массив объектов с id и order

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных'
      });
    }

    // Обновляем порядок для каждого элемента
    const updatePromises = items.map(item => 
      Gallery.update({ order: item.order }, { where: { id: item.id } })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Порядок фотографий успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка при обновлении порядка:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении порядка'
    });
  }
};

module.exports = {
  getGalleryByCoachId,
  getGalleryItemById,
  addToGallery,
  updateGalleryItem,
  deleteGalleryItem,
  updateGalleryOrder
};