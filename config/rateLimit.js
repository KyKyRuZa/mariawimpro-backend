const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => 
  rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too Many Requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000) + ' seconds' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessfulRequests,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000) + ' seconds' 
      });
    }
  });

const authLimiter = createLimiter(15 * 60 * 1000, 5, 'Слишком много попыток входа.', true);
const uploadLimiter = createLimiter(15 * 60 * 1000, 10, 'Слишком много загрузок.');
const generalLimiter = createLimiter(15 * 60 * 1000, 100, 'Слишком много запросов.');
const strictLimiter = createLimiter(60 * 60 * 1000, 3, 'Превышен лимит безопасности.', true);

const staticLimiter = createLimiter(15 * 60 * 1000, 500, 'Слишком много запросов к статическим файлам.');
const healthLimiter = createLimiter(1 * 60 * 1000, 10, 'Слишком много проверок здоровья.');

module.exports = {
  authLimiter,
  uploadLimiter,
  generalLimiter,
  strictLimiter,
  staticLimiter,   
  healthLimiter    
};