const express = require('express');
const path = require('path');
const fs = require('fs');

// Конфигурации
const { helmetConfig, cors } = require('./config/security');
const { authLimiter, uploadLimiter, generalLimiter } = require('./config/rateLimit');
const logger = require('./config/logger');
const morganMiddleware = require('./middleware/morgan');
const errorHandler = require('./middleware/errorHandler');

// Роуты
const routes = require('./routes');

const app = express();

// Базовые middleware
app.set('trust proxy', 1);
app.use(helmetConfig);
app.use(cors);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morganMiddleware);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/gallery', uploadLimiter);
app.use('/api', generalLimiter);

// Статические файлы
app.use('/assets', express.static('/var/www/assets', {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'public, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', routes);

// Обработка ошибок
app.use(errorHandler);

module.exports = app;