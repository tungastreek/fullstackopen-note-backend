const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');

const NoteModel = require('../src/models/note');
const app = require('../src/app');
const { initialNotes } = require('./note-api-test-helper');

const api = supertest(app);

describe('Note API', () => {
  beforeEach(async () => {
    await NoteModel.deleteMany({});
    await Promise.all(initialNotes.map((note) => new NoteModel(note).save()));
  });

  describe('GET /api/notes', () => {
    test('notes are returned as JSON', async () => {
      await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    test('all notes are returned', async () => {
      const response = await api.get('/api/notes');
      assert.strictEqual(response.body.length, initialNotes.length);
    });

    test('a specific note is within the returned notes', async () => {
      const response = await api.get('/api/notes');
      const contents = response.body.map((note) => note.content);
      assert(contents.includes(initialNotes[0].content));
    });
  });

  describe('POST /api/notes', () => {
    test('a valid note can be added', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      };

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const response = await api.get('/api/notes');
      const contents = response.body.map((note) => note.content);

      assert.strictEqual(response.body.length, initialNotes.length + 1);
      assert(contents.includes(newNote.content));
    });

    test('note without content is not added', async () => {
      const newNote = {
        important: true,
      };

      await api.post('/api/notes').send(newNote).expect(400);

      const response = await api.get('/api/notes');
      assert.strictEqual(response.body.length, initialNotes.length);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    test('a note can be deleted', async () => {
      const response = await api.get('/api/notes');
      const noteToDelete = response.body[0];

      await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

      const afterResponse = await api.get('/api/notes');
      assert.strictEqual(afterResponse.body.length, initialNotes.length - 1);

      const contents = afterResponse.body.map((note) => note.content);
      assert(!contents.includes(noteToDelete.content));
    });

    test('fails with status code 404 if note does not exist', async () => {
      // Create a note and then delete it to get a valid but non-existing id
      const newNote = new NoteModel({
        content: 'Will be deleted soon',
        important: false,
      });
      const savedNote = await newNote.save();
      const validNonexistingId = savedNote._id.toString();
      await NoteModel.findByIdAndDelete(validNonexistingId);

      await api.delete(`/api/notes/${validNonexistingId}`).expect(404);
    });

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = 'notavalidid';

      await api.delete(`/api/notes/${invalidId}`).expect(400);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
