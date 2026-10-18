const app = require('./app');
const { config, validateStartupConfig } = require('./config/env');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

async function start() {
  validateStartupConfig();
  await connectDatabase();
  logger.info('MongoDB connected');
  app.listen(config.port, () => {
    logger.info('Server started', { port: config.port, environment: config.nodeEnv });
    console.log(`API running at http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  logger.error('Server startup failed', { errorType: error.name });
  console.error('Unable to start API. Check .env settings and MongoDB connectivity.');
  process.exit(1);
});
