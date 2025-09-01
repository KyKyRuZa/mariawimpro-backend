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
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: '/var/log/nodejs/mariaswimpro.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
});

// === Morgan с датой ===
const morganMiddleware = morgan((tokens, req, res) => {
  const date = new Date().toISOString().replace('T', ' ').split('.')[0];
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return `[${date}] ${ip} ${method} ${url} ${status} ${responseTime} ms`;
}, {
  stream: { write: (message) => logger.info(message.trim()) }
});

// === CORS Configuration ===

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin:allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morganMiddleware);

// Serve static files from correct path
app.use('/assets', express.static('/var/www/assets', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// === API маршруты ===
app.use('/api/coaches', coachRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tariffs', tariffsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);

// === Централизованная обработка ошибок ===
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  logger.error(`Ошибка: ${err.message} - Stack: ${err.stack}`);
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// === SSL Configuration ===
let sslOptions = null;
if (process.env.USE_HTTPS === 'true') {
  try {
    sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
      ca: fs.readFileSync('/etc/letsencrypt/live/mariaswimpro.ru/chain.pem', 'utf8')
    };
    console.log('✅ SSL сертификаты загружены');
  } catch (error) {
    console.error('❌ Ошибка загрузки SSL сертификатов:', error.message);
    process.exit(1);
  }
}

// === Запуск сервера ===
const startServer = async () => {
  try {
    // Создаем директорию для логов
    const logDir = '/var/log/nodejs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    await sequelize.authenticate();
    console.log('✅ База данных подключена');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('🔁 База данных синхронизирована');
    }

    if (process.env.USE_HTTPS === 'true' && sslOptions) {
      https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS сервер запущен на порту ${PORT}`);
        console.log(`🌐 Доступно по: https://mariaswimpro.ru:${PORT}`);
      });
    } else {
      app.listen(PORT, 'localhost', () => {
        console.log(`🚀 HTTP сервер запущен на порту ${PORT}`);
        console.log(`🌐 Доступно по: http://mariaswimpro.ru:${PORT}`);
      });
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      sequelize.close().then(() => {
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error(`❌ Ошибка запуска сервера: ${error.message}`);
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

startServer();