const { rateLimit } = require('express-rate-limit');
const logger = require('../utils/logger');

const baseOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler(req, res) {
    logger.warn('Rate limit exceeded', { method: req.method, path: req.path });
    res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }
};

const authLimiter = rateLimit({ ...baseOptions, limit: 10 });
const apiLimiter = rateLimit({ ...baseOptions, limit: 500 });

module.exports = { authLimiter, apiLimiter };
