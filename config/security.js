const helmet = require('helmet');
const cors = require('cors');

const allowedDomains = process.env.ALLOWED_ORIGINS?.split(',') || [];
const cspDomains = process.env.CSP_ALLOWED_DOMAINS?.split(',') || [];

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https:"
      ],
      scriptSrc: [
        "'self'",
        "https:", 
        "'unsafe-eval'"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://*.maps.yandex.net", 
        "https://core-renderer-tiles.maps.yandex.net"
      ],
      connectSrc: [
        "'self'",
        "https://*.maps.yandex.net",
        "https://api-maps.yandex.ru"
      ],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://yandex.ru",
        "https://*.yandex.ru",
        "https://yandex.com",
        "https://*.yandex.com",
        "https://maps.yandex.ru",
        "https://api-maps.yandex.ru"
      ],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      childSrc: [
        "'self'",
        "https://*.yandex.ru",
        "https://*.yandex.com"
      ]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false 
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = {
  helmetConfig,
  cors: cors(corsOptions)
};