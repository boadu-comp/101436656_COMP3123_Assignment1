const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  nodeEnv: process.env.NODE_ENV || 'development',
};

function validateStartupConfig() {
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error('PORT must be a valid port number.');
  }
  if (!config.mongoUri) {
    throw new Error('Set MONGODB_URI in your .env file.');
  }
  if (
    !config.jwtSecret ||
    config.jwtSecret.length < 32 ||
    config.jwtSecret.startsWith('REPLACE_THIS_')
  ) {
    throw new Error('Set JWT_SECRET to a unique random secret of at least 32 characters.');
  }
}

module.exports = { config, validateStartupConfig };
