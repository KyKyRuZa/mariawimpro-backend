const express = require('express');
const router = express.Router();

// Импортируем все роуты
const coachRoutes = require('./coach');
const newsRoutes = require('./news');
const tariffsRoutes = require('./tariffs');
const authRoutes = require('./auth');
const galleryRoutes = require('./gallery');

// Используем роуты
router.use('/coaches', coachRoutes);
router.use('/news', newsRoutes);
router.use('/tariffs', tariffsRoutes);
router.use('/auth', authRoutes);
router.use('/gallery', galleryRoutes);

module.exports = router;