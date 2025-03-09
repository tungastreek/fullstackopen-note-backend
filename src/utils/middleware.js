const { ENVIRONMENT_CONFIG } = require('./config');
const logger = require('./logger');
const Joi = require('joi');

// Create a wrapper for error logging
const logError = (message) => {
  if (ENVIRONMENT_CONFIG.isTest) return;
  logger.error(message);
};

const shouldSkipLog = () => ENVIRONMENT_CONFIG.isTest;

// Unknown endpoint handler
const unknownEndpoint = (req, res) => {
  res.status(404).end();
};

// Joi validation middleware
const validateWith = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw new Joi.ValidationError(error.details[0].message);
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  logError(err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error: ${err.message}` });
  }

  if (err.name === 'MongoServerError' && err.message && err.message.includes('E11000')) {
    return res.status(400).json({ error: `Duplicate resource: ${err.message}` });
  }

  if (err.message && err.message.includes('Invalid username or password')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next(err);
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  shouldSkipLog,
  logError,
  validateWith,
};
