
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => 
  rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too Many Requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessfulRequests,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
      });
    }
  });

const authLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Слишком много попыток входа. Пожалуйста, попробуйте позже.',
  true
);

const uploadLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Слишком много загрузок. Попробуйте позже.'
);

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Слишком много запросов. Попробуйте позже.'
);

const strictLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Превышен лимит безопасности. Попробуйте через час.',
  true
);

module.exports = {
  authLimiter,
  uploadLimiter,
  generalLimiter,
  strictLimiter
};
