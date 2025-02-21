const notesRouter = require('express').Router();
const Joi = require('joi');
const NoteModel = require('../models/note');

// Define the schema for validation
const noteCreateSchema = Joi.object({
  content: Joi.string().min(5).required(),
  important: Joi.boolean().optional(),
});

const noteUpdateSchema = Joi.object({
  id: Joi.string().optional(),
  content: Joi.string().min(5).required(),
  important: Joi.boolean().optional(),
});

// Get all notes
notesRouter.get('/', async (req, res, next) => {
  try {
    const notes = await NoteModel.find({});
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Create a new note
notesRouter.post('/', async (req, res, next) => {
  const { error } = noteCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { content, important = false } = req.body;
  const note = new NoteModel({ content, important });

  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (error) {
    next(error);
  }
});

// Get a note by ID
notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).end();
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Update a note by ID
notesRouter.put('/:id', async (req, res, next) => {
  const { error } = noteUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) {
      return res.status(404).end();
    }

    note.content = req.body.content;
    note.important = req.body.important;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// Delete a note by ID
notesRouter.delete('/:id', async (req, res, next) => {
  try {
    await NoteModel.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = notesRouter;
