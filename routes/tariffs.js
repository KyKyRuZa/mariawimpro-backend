// routes/tariffs.js
const express = require('express');
const router = express.Router();
const {
  getAllTariffs,
  getTariffsByCategory,
  getTariffById,
  updateTariffPrice,
  updateTariff,
  createTariff,
  deleteTariff
} = require('../controllers/tariffs');

// Маршруты для API
router.get('/', getAllTariffs);              // Получить все тарифы
router.get('/category/:category', getTariffsByCategory); // Получить тарифы по категории
router.get('/:id', getTariffById);           // Получить тариф по ID
router.post('/', createTariff);              // Создать тариф
router.patch('/:id/price', updateTariffPrice); // Обновить только цену
router.patch('/:id', updateTariff);          // Обновить тариф полностью
router.delete('/:id', deleteTariff);         // Удалить тариф

module.exports = router;