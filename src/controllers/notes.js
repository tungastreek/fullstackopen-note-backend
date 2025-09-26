const notesRouter = require('express').Router();
const Joi = require('joi');
const NoteService = require('../services/note');
const { validateWith, authenticate } = require('../utils/middleware');
const UserModel = require('../models/user');
const CustomError = require('../utils/custom-error');

// Define the schema for validation
const noteCreateSchema = Joi.object({
  content: Joi.string().min(5).required(),
  important: Joi.boolean().optional(),
});

const noteUpdateSchema = Joi.object({
  id: Joi.string().optional(),
  content: Joi.string().min(5).required(),
  important: Joi.boolean().required(),
});

// Get all notes
notesRouter.get('/', async (req, res) => {
  const notes = await NoteService.getAll();
  res.json(notes);
});

// Create a new note
notesRouter.post('/', authenticate, validateWith(noteCreateSchema), async (req, res) => {
  const { content, important = false } = req.body;
  const userId = req.authPayload.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomError('Invalid userId', 'AuthorizationError');
  }

  const noteData = {
    content,
    important,
    user: user.id,
  };

  const savedNote = await NoteService.create(noteData);
  user.notes = user.notes.concat(savedNote.id);
  await user.save();
  res.status(201).json(savedNote);
});

// Get a note by ID
notesRouter.get('/:id', async (req, res) => {
  const note = await NoteService.getById(req.params.id);
  res.json(note);
});

// Update a note by ID
notesRouter.put('/:id', authenticate, validateWith(noteUpdateSchema), async (req, res) => {
  const userId = req.authPayload.id;
  const noteId = req.params.id;
  const updatedNote = await NoteService.updateByIdAndUserId(noteId, userId, req.body);
  res.json(updatedNote);
});

// Delete a note by ID
notesRouter.delete('/:id', authenticate, async (req, res) => {
  const userId = req.authPayload.id;
  await NoteService.deleteByIdAndUserId(req.params.id, userId);
  res.status(204).end();
});

module.exports = notesRouter;
