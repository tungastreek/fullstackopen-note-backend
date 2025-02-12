const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const NoteModel = require('./src/models/note');

const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/api/notes', (request, response, next) => {
  NoteModel
    .find()
    .then((notes) => {
      response.json(notes);
    })
    .catch((error) => next(error));
});

app.post('/api/notes', (request, response, next) => {
  const body = request.body;

  const newNote = new NoteModel({
    content: body.content,
    important: body.important || false,
  });

  newNote
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.get('/api/notes/:id', (request, response, next) => {
  NoteModel
    .findById(request.params.id)
    .then((note) => {
      if (!note) {
        response.status(404).end();
      } else {
        response.json(note);
      }
    })
    .catch((error) => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  NoteModel
    .findById(request.params.id)
    .then((note) => {
      if (note) {
        const body = request.body;
        if (!body.content) {
          return response.status(400).json({ error: 'Content is missing' });
        }
        if (body.important === null) {
          return response.status(400).json({ error: 'Important is missing' });
        }
        note.content = body.content;
        note.important = body.important;
        note.save().then((savedNote) => {
          response.json(savedNote);
        });
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {
  NoteModel
    .findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error ${err.message}` });
  }

  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
