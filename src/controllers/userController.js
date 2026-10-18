const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { config } = require('../config/env');

async function signup(req, res) {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    logger.warn('Registration rejected: duplicate account');
    throw new ApiError(409, 'Username or email is already registered');
  }

  const user = await User.create({ username, email, password });
  logger.info('User registered', { userId: user.id });
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: user.toJSON() }
  });
}

async function login(req, res) {
  const { username, email, password } = req.body;
  if ((!username && !email) || (username && email)) {
    throw new ApiError(400, 'Provide either username or email, plus password');
  }

  const lookup = username ? { username } : { email };
  const user = await User.findOne(lookup).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Login failed: invalid credentials');
    throw new ApiError(401, 'Invalid username/email or password');
  }

  const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
    issuer: 'comp3123-assignment1'
  });

  logger.info('Login succeeded', { userId: user.id });
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      token_type: 'Bearer',
      expires_in: config.jwtExpiresIn,
      user: user.toJSON()
    }
  });
}

module.exports = { signup, login };
