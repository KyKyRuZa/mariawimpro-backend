const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  logger.error(`Ошибка: ${err.message} - Stack: ${err.stack}`);
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};