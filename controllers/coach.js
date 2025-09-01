const Coach = require('../models/coach');
const path = require('path');
const fs = require('fs');

const uploadPath = '/var/www/assets';

const getBaseUrl = (req) => {
  return process.env.NODE_ENV === 'production' 
    ? 'https://mariaswimpro.ru'  // HTTPS для продакшена
    : `${req.protocol}://${req.get('host')}`; // Для разработки
};

const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const baseUrl = getBaseUrl(req);
    
    const coachesWithImageUrl = coaches.map(coach => {
      const coachData = coach.toJSON();
      if (coachData.photo) {
        coachData.photoUrl = `${baseUrl}/assets/${coachData.photo}`;
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
    
    const baseUrl = getBaseUrl(req);
    const coachData = coach.toJSON();
    
    if (coachData.photo) {
      coachData.photoUrl = `${baseUrl}/assets/${coachData.photo}`;
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

const createCoach = async (req, res) => {
  try {
    const { fullName, education, specialization, merits, experience, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение обязательно для загрузки'
      });
    }
    
    if (!fullName || !education || !specialization || !merits || !experience || !description) {
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
      photo: req.file.filename,
      education,
      specialization,
      merits,
      experience,
      description
    });
    
    const baseUrl = getBaseUrl(req);
    const coachData = newCoach.toJSON();
    coachData.photoUrl = `${baseUrl}/assets/${coachData.photo}`;
    
    res.status(201).json({
      success: true,
      message: 'Тренер успешно создан',
      data: coachData
    });
  } catch (error) {
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

const updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, education, specialization, merits, experience, description } = req.body;
    
    const coach = await Coach.findByPk(id);
    
    if (!coach) {
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
    
    if (req.file) {
      if (coach.photo) {
        const oldImagePath = path.join(uploadPath, coach.photo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.photo = req.file.filename;
    }
    
    await coach.update(updateData);
    
    const baseUrl = getBaseUrl(req);
    const coachData = coach.toJSON();
    coachData.photoUrl = `${baseUrl}/assets/${coachData.photo}`;
    
    res.json({
      success: true,
      message: 'Тренер успешно обновлен',
      data: coachData
    });
  } catch (error) {
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