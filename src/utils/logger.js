const fs = require('fs');
const path = require('path');
const winston = require('winston');

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} ${level}: ${message}`
      )
    )
  })
];

if (!process.env.VERCEL) {
  const directory = path.resolve(__dirname, '../../logs');

  fs.mkdirSync(directory, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(directory, 'combined.log')
    }),
    new winston.transports.File({
      filename: path.join(directory, 'errors.log'),
      level: 'error'
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports
});

module.exports = logger;