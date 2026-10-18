const fs = require('fs');
const path = require('path');
const winston = require('winston');

const directory = path.resolve(__dirname, '../../logs');
fs.mkdirSync(directory, { recursive: true });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(directory, 'combined.log') }),
    new winston.transports.File({ filename: path.join(directory, 'errors.log'), level: 'error' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
      )
    })
  ]
});

module.exports = logger;
