const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPromoNews
} = require('../controllers/news');

router.get('/', getAllNews); // Получение всех новостей
router.get('/promo', getPromoNews); // Получение промо-новостей
router.get('/:id', getNewsById); // Получение новости по ID
router.post('/', createNews); // Создание новости
router.put('/:id', updateNews); // Обновление новости
router.delete('/:id', deleteNews); // Удаление новости

module.exports = router;