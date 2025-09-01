const Coach = require('../models/coach');
const path = require('path');
const fs = require('fs');

// Базовый путь для загрузки файлов
const uploadPath = '/var/www/assets';

// Получение всех тренеров
const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Добавляем полный URL к изображениям
    const coachesWithImageUrl = coaches.map(coach => {
      const coachData = coach.toJSON();
      if (coachData.photo) {
        coachData.photoUrl = `${req.protocol}://${req.get('host')}/assets/${coachData.photo}`;
      }
      return coachData;
    });
    
    res.json({
      success: true,
      data: coachesWithImageUrl
    });
  } catch (error) {
    console.error('Ошибка при получении тренеров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении тренеров'
    });
  }
};

// Получение одного тренера по ID
const getCoachById = async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await Coach.findByPk(id);
    
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Тренер не найден'
      });
    }
    
    // Добавляем полный URL к изображению
    const coachData = coach.toJSON();
    if (coachData.photo) {
      coachData.photoUrl = `${req.protocol}://${req.get('host')}/assets/${coachData.photo}`;
    }
    
    res.json({
      success: true,
      data: coachData
    });
  } catch (error) {
    console.error('Ошибка при получении тренера:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении тренера'
    });
  }
};

// Создание нового тренера
const createCoach = async (req, res) => {
  try {
    const { fullName, education, specialization, merits, experience, description } = req.body;
    
    // Проверяем, загружено ли изображение
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение обязательно для загрузки'
      });
    }
    
    // Валидация обязательных полей
    if (!fullName || !education || !specialization || !merits || !experience || !description) {
      // Удаляем загруженный файл, если валидация не прошла
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны для заполнения'
      });
    }
    
    const newCoach = await Coach.create({
      fullName,
      photo: req.file.filename, // Сохраняем имя файла
      education,
      specialization,
      merits,
      experience,
      description
    });
    
    // Добавляем полный URL к изображению
    const coachData = newCoach.toJSON();
    coachData.photoUrl = `${req.protocol}://${req.get('host')}/assets/${coachData.photo}`;
    
    res.status(201).json({
      success: true,
      message: 'Тренер успешно создан',
      data: coachData
    });
  } catch (error) {
    // Удаляем загруженный файл при ошибке
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Ошибка при создании тренера:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании тренера'
    });
  }
};

// Обновление тренера
const updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, education, specialization, merits, experience, description } = req.body;
    
    const coach = await Coach.findByPk(id);
    
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
    
    let updateData = {
      fullName: fullName || coach.fullName,
      education: education || coach.education,
      specialization: specialization || coach.specialization,
      merits: merits || coach.merits,
      experience: experience || coach.experience,
      description: description || coach.description
    };
    
    // Если загружено новое изображение
    if (req.file) {
      // Удаляем старое изображение
      if (coach.photo) {
        const oldImagePath = path.join(uploadPath, coach.photo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.photo = req.file.filename;
    }
    
    await coach.update(updateData);
    
    // Добавляем полный URL к изображению
    const coachData = coach.toJSON();
    coachData.photoUrl = `${req.protocol}://${req.get('host')}/assets/${coachData.photo}`;
    
    res.json({
      success: true,
      message: 'Тренер успешно обновлен',
      data: coachData
    });
  } catch (error) {
    // Удаляем загруженный файл при ошибке
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Ошибка при обновлении тренера:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении тренера'
    });
  }
};

// Удаление тренера
const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coach = await Coach.findByPk(id);
    
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Тренер не найден'
      });
    }
    
    // Удаляем изображение
    if (coach.photo) {
      const imagePath = path.join(uploadPath, coach.photo);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await coach.destroy();
    
    res.json({
      success: true,
      message: 'Тренер успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении тренера:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении тренера'
    });
  }
};

module.exports = {
  getAllCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
};