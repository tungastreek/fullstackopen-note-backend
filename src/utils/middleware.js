const Joi = require('joi');
const jwt = require('jsonwebtoken');

const logger = require('./logger');
const CustomError = require('./custom-error');

// Token verification middleware
const authenticate = (req, res, next) => {
  let token = null;
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring('bearer '.length);
  }
  const authPayload = jwt.verify(token, process.env.JWT_SECRET);
  if (!authPayload.id) {
    throw new CustomError('Invalid token', 'AuthorizationError');
  }
  req.authPayload = authPayload;
  next();
};

// Joi validation middleware
const validateWith = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw new Joi.ValidationError(error.details[0].message);
  }
  next();
};

// Unknown endpoint handler
const unknownEndpoint = (req, res) => {
  res.status(404).end();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  logger.logError(err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error: ${err.message}` });
  }

  if (err.name === 'MongoServerError' && err.message && err.message.includes('E11000')) {
    return res.status(400).json({ error: `Duplicate resource: ${err.message}` });
  }

  if (err.name === 'AuthorizationError') {
    return res.status(401).json({ error: `${err.message}` });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  next(err);
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  validateWith,
  authenticate,
};
