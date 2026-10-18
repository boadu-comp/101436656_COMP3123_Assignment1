const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { config } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiters');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

const app = express();
app.disable('x-powered-by');

if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(requestLogger);
app.use(express.json({ limit: '16kb' }));
app.use(apiLimiter);
let connecting;

app.use(async (req, res, next) => {
  if (!process.env.VERCEL) return next();

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!connecting) {
        connecting = connectDatabase().finally(() => {
          connecting = null;
        });
      }
      await connecting;
    }
    next();
  } catch (error) {
  console.error('Vercel database connection error:', {
    name: error.name,
    code: error.code || null,
    databaseConfigured: Boolean(config.mongoUri),
    connectionState: mongoose.connection.readyState
  });

  next(error);
}
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
