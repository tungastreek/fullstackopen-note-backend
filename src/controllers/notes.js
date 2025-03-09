const notesRouter = require('express').Router();
const Joi = require('joi');
const NoteModel = require('../models/note');
const { validateWith } = require('../utils/middleware');
const UserModel = require('../models/user');

// Define the schema for validation
const noteCreateSchema = Joi.object({
  content: Joi.string().min(5).required(),
  important: Joi.boolean().optional(),
  userId: Joi.string().required(),
});

const noteUpdateSchema = Joi.object({
  id: Joi.string().optional(),
  content: Joi.string().min(5).required(),
  important: Joi.boolean().required(),
  userId: Joi.string().optional(),
});

// Get all notes
notesRouter.get('/', async (req, res) => {
  const notes = await NoteModel.find({}).populate('user', { username: 1, name: 1 });
  res.json(notes);
});

// Create a new note
notesRouter.post('/', validateWith(noteCreateSchema), async (req, res) => {
  const { content, important = false, userId } = req.body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Joi.ValidationError('Invalid userId');
  }

  const note = new NoteModel({
    content,
    important,
    user: user.id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote.id);
  await user.save();
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
notesRouter.put('/:id', validateWith(noteUpdateSchema), async (req, res) => {
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
  const note = await NoteModel.findByIdAndDelete(req.params.id);
  if (!note) {
    return res.status(404).end();
  }
  res.status(204).end();
});

module.exports = notesRouter;
