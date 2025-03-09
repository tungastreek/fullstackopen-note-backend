require('dotenv').config();

const PORT = process.env.PORT;

const ENVIRONMENT_CONFIG = {
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === 'production',
};

const MONGODB_ENV_URI = {
  dev: process.env.DEV_MONGODB_URI,
  test: process.env.TEST_MONGODB_URI,
  prod: process.env.MONGODB_URI,
};

const MONGODB_URI = MONGODB_ENV_URI[process.env.NODE_ENV];

module.exports = {
  PORT,
  MONGODB_URI,
  ENVIRONMENT_CONFIG,
};
