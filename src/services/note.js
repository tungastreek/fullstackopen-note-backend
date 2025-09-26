const NoteModel = require('../models/note');
const CustomError = require('../utils/custom-error');

const getAll = async () => {
  const notes = await NoteModel.find({}).populate('user', { username: 1, name: 1 });
  return notes;
};

const getById = async (id) => {
  const note = await NoteModel.findById(id).populate('user', { username: 1, name: 1 });
  if (!note) {
    throw new CustomError('Note not found', 'NotFoundError');
  }
  return note;
};

const create = async (noteData) => {
  const note = new NoteModel(noteData);
  return await note.save();
};

const updateByIdAndUserId = async (id, userId, updateData) => {
  const updatedNote = await NoteModel.findOneAndUpdate({ _id: id, user: userId }, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedNote) {
    throw new CustomError('Note not found', 'NotFoundError');
  }
  return updatedNote;
};

const deleteByIdAndUserId = async (id, userId) => {
  const deletedNote = await NoteModel.findOneAndDelete({ _id: id, user: userId });
  if (!deletedNote) {
    throw new CustomError('Note not found', 'NotFoundError');
  }
  return deletedNote;
};

module.exports = { getAll, getById, create, updateByIdAndUserId, deleteByIdAndUserId };
