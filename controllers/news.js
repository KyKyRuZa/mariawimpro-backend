const News = require('../models/news');

// Получение всех новостей
const getAllNews = async (req, res) => {
  try {
    const news = await News.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении новостей'
    });
  }
};

// Получение новости по ID
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findByPk(id);
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      });
    }
    
    res.json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    console.error('Ошибка при получении новости:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении новости'
    });
  }
};

// Создание новости
const createNews = async (req, res) => {
  try {
    const { title, description, extra, promo } = req.body;
    
    // Валидация обязательных полей
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Заголовок и описание обязательны для заполнения'
      });
    }
    
    const newNews = await News.create({
      title,
      description,
      extra: extra || null,
      promo: promo || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Новость успешно создана',
      data: newNews
    });
  } catch (error) {
    console.error('Ошибка при создании новости:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании новости'
    });
  }
};

// Обновление новости
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, extra, promo } = req.body;
    
    const newsItem = await News.findByPk(id);
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      });
    }
    
    await newsItem.update({
      title: title || newsItem.title,
      description: description || newsItem.description,
      extra: extra !== undefined ? extra : newsItem.extra,
      promo: promo !== undefined ? promo : newsItem.promo
    });
    
    res.json({
      success: true,
      message: 'Новость успешно обновлена',
      data: newsItem
    });
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении новости'
    });
  }
};

// Удаление новости
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsItem = await News.findByPk(id);
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      });
    }
    
    await newsItem.destroy();
    
    res.json({
      success: true,
      message: 'Новость успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении новости'
    });
  }
};

// Получение промо-новостей
const getPromoNews = async (req, res) => {
  try {
    const promoNews = await News.findAll({
      where: {
        promo: true
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: promoNews
    });
  } catch (error) {
    console.error('Ошибка при получении промо-новостей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении промо-новостей'
    });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPromoNews
};