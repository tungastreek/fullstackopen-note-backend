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
notesRouter.get('/', async (req, res) => {
  const notes = await NoteModel.find({});
  res.json(notes);
});

// Create a new note
notesRouter.post('/', async (req, res) => {
  const { error } = noteCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { content, important = false } = req.body;
  const note = new NoteModel({ content, important });

  const savedNote = await note.save();
  res.status(201).json(savedNote);
});

// Get a note by ID
notesRouter.get('/:id', async (req, res) => {
  const note = await NoteModel.findById(req.params.id);
  if (!note) {
    return res.status(404).end();
  }
  res.json(note);
});

// Update a note by ID
notesRouter.put('/:id', async (req, res) => {
  const { error } = noteUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const note = await NoteModel.findById(req.params.id);
  if (!note) {
    return res.status(404).end();
  }

  note.content = req.body.content;
  note.important = req.body.important;

  const updatedNote = await note.save();
  res.json(updatedNote);
});

// Delete a note by ID
notesRouter.delete('/:id', async (req, res) => {
  await NoteModel.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = notesRouter;
