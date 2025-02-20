const notesRouter = require('express').Router();
const NoteModel = require('../models/note');

notesRouter.get('/', (req, res) => {
  NoteModel.find({}).then((notes) => res.json(notes));
});

notesRouter.post('/', (req, res, next) => {
  const body = req.body;
  const note = new NoteModel({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => res.json(savedNote))
    .catch((err) => next(err));
});

notesRouter.get('/:id', (req, res, next) => {
  NoteModel.findById(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).end();
      }
      res.json(note);
    })
    .catch((error) => next(error));
});

notesRouter.put('/:id', (req, res, next) => {
  NoteModel.findById(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).end;
      }
      note.content = req.body.content;
      note.important = req.body.important;
      note
        .save()
        .then((savedNote) => {
          res.json(savedNote);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

notesRouter.delete('/:id', (req, res, next) => {
  NoteModel.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((error) => next(error));
});

module.exports = notesRouter;
