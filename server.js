require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./database');
const logger = require('./config/logger');
const fs = require('fs');

require('./models/associations');

const PORT = process.env.PORT || 3001;

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

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 HTTP сервер запущен на порту ${PORT}`);
      console.log(`🌐 Доступно только локально: http://127.0.0.1:${PORT}`);
      console.log(`🔐 Внешний доступ через: https://mariaswimpro.ru`);
      console.log(`🛡️  Защита Helmet и Rate Limit активирована`);
    });

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