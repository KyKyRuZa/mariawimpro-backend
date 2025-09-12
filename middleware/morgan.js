const morgan = require('morgan');
const logger = require('../config/logger');

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

module.exports = morganMiddleware;