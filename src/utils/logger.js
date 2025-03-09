const { ENVIRONMENT_CONFIG } = require('./config');

const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  console.error(...params);
};

const logError = (message) => {
  if (ENVIRONMENT_CONFIG.isTest) return;
  error(message);
};

const shouldSkipLog = () => ENVIRONMENT_CONFIG.isTest;

module.exports = {
  info,
  error,
  logError,
  shouldSkipLog,
};
