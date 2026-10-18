const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { config } = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('Authorization');
  const match = authorization && /^Bearer\s+(\S+)$/i.exec(authorization);
  if (!match) {
    logger.warn('Authentication failed: missing bearer token', { path: req.path });
    throw new ApiError(401, 'Missing or malformed Bearer token');
  }

  let payload;
  try {
    payload = jwt.verify(match[1], config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'comp3123-assignment1'
    });
  } catch (error) {
    logger.warn('Authentication failed: invalid or expired token', { path: req.path });
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }

  if (!mongoose.isValidObjectId(payload.sub) || !(await User.exists({ _id: payload.sub }))) {
    throw new ApiError(401, 'Authentication user no longer exists');
  }

  req.user = { id: payload.sub };
  next();
});

module.exports = authenticate;
