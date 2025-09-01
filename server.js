const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const winston = require('winston');
const { format, transports } = winston;
const { combine, printf } = format;

const coachRoutes = require('./routes/coach');
const newsRoutes = require('./routes/news');
const tariffsRoutes = require('./routes/tariffs');
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
// Загружаем .env
dotenv.config();
require('./models/associations');

// Импортируем базу данных
const { sequelize } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// === Формат логов ===
const logFormat = printf(({ level, message }) => {
  return `[${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [new transports.Console()],
});

// === Morgan с датой ===
const morganMiddleware = morgan((tokens, req, res) => {
  const date = new Date().toISOString().replace('T', ' ').split('.')[0];
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  return `[${date}] ${method} ${url} ${status} ${responseTime} ms`;
}, {
  stream: { write: (message) => logger.info(message.trim()) }
});

app.use(cors({
  origin: [
    'http://95.81.118.136',
    'http://mariaswimpro.ru',
    'https://mariaswimpro.ru',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morganMiddleware);
app.use('/assets', express.static('/var/www/assets'));


// === API маршруты ===
app.use('/api/coaches', coachRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tariffs', tariffsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);

// === Централизованная обработка ошибок ===
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  logger.error(`Ошибка: ${err.message}`);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});

// // === SSL Options (если нужно) ===
// const sslOptions = {
//   key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
//   cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8')
// };

// === Запуск сервера ===
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ База данных подключена');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('🔁 База данных синхронизирована');
    }

    if (process.env.USE_HTTPS === 'true') {
      https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS сервер запущен на порту ${PORT}`);
      });
    } else {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTP сервер запущен на порту ${PORT}`);
      });
    }
  } catch (error) {
    logger.error(`❌ Ошибка запуска сервера: ${error.message}`);
    process.exit(1);
  }
};

startServer();