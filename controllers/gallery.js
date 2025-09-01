const Gallery = require('../models/gallery');
const Coach = require('../models/coach');
const path = require('path');
const fs = require('fs');

// Получение всех фотографий галереи для конкретного тренера
const getGalleryByCoachId = async (req, res) => {
  try {
    const { coachId } = req.params;

    // Проверяем существование тренера
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

    // Добавляем полные URL к изображениям
    const galleryWithUrls = gallery.map(item => {
      const galleryData = item.toJSON();
      if (galleryData.photoUrl) {
        galleryData.fullPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(galleryData.photoUrl)}`;
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

// Получение одной фотографии по ID
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

    // Добавляем полный URL к изображению
    const galleryData = galleryItem.toJSON();
    if (galleryData.photoUrl) {
      galleryData.fullPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(galleryData.photoUrl)}`;
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

// Добавление фотографии в галерею
const addToGallery = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { caption, order = 0 } = req.body;

    // Проверяем существование тренера
    const coach = await Coach.findByPk(coachId);
    if (!coach) {
      // Удаляем загруженный файл, если тренер не найден
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Тренер не найден'
      });
    }

    // Проверяем, загружено ли изображение
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

    // Добавляем полный URL к изображению
    const galleryData = newGalleryItem.toJSON();
    galleryData.fullPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${galleryData.photoUrl}`;

    res.status(201).json({
      success: true,
      message: 'Фотография успешно добавлена в галерею',
      data: galleryData
    });
  } catch (error) {
    // Удаляем загруженный файл при ошибке
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

// Обновление фотографии в галерее
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, order } = req.body;

    const galleryItem = await Gallery.findByPk(id);

    if (!galleryItem) {
      // Удаляем загруженный файл, если элемент не найден
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

    // Если загружено новое изображение
    if (req.file) {
      // Удаляем старое изображение
      if (galleryItem.photoUrl) {
        const oldImagePath = path.join(__dirname, '../uploads', galleryItem.photoUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.photoUrl = req.file.filename;
    }

    await galleryItem.update(updateData);

    // Добавляем полный URL к изображению
    const galleryData = galleryItem.toJSON();
    galleryData.fullPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${galleryData.photoUrl}`;

    res.json({
      success: true,
      message: 'Фотография успешно обновлена',
      data: galleryData
    });
  } catch (error) {
    // Удаляем загруженный файл при ошибке
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

// Удаление фотографии из галереи
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

    // Удаляем изображение
    if (galleryItem.photoUrl) {
      const imagePath = path.join(__dirname, '../uploads', galleryItem.photoUrl);
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

// Обновление порядка фотографий
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