const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { config } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiters');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(requestLogger);
app.use(express.json({ limit: '16kb' }));
app.use(apiLimiter);

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
