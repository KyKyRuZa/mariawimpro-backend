require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./database');
const logger = require('./config/logger');
const fs = require('fs');

require('./models/associations');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    const logDir = '/var/log/nodejs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    console.log('✅ База данных подключена');

    await sequelize.authenticate();
    console.log('✅ Подключение к БД подтверждено');

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 HTTP сервер запущен на порту ${PORT}`);

    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      sequelize.close().then(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error(`❌ Ошибка запуска сервера: ${error.message}`);
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

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