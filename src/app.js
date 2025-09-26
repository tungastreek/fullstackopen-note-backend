const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const crypto = require('crypto');

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/notes');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

mongoose.set('strictQuery', true);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => logger.error('Error connecting to MongoDB:', error.message));

const app = express();
app.use(express.static('dist'));
app.use(express.json());

// Request ID middleware for correlation
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  if (!config.ENVIRONMENT_CONFIG.isTest) {
    logger.info(`Request ${req.method} ${req.path} - ID: ${req.id}`);
  }
  next();
});

app.use(morgan('dev', { skip: logger.shouldSkipLog }));
app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
