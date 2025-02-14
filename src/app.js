const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/notes');

mongoose.set('strictQuery', true);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(error => logger.error('Error connecting to MongoDB:', error.message));


const app = express();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/notes', notesRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
