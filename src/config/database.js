const mongoose = require('mongoose');
const { config } = require('./env');

async function connectDatabase() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
}

module.exports = { connectDatabase };
