const winston = require('winston');
const { format, transports } = winston;
const { combine, printf } = format;

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
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
});

module.exports = logger;