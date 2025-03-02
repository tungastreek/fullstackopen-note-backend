const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');

const NoteModel = require('../src/models/note');
const app = require('../src/app');
const noteApiTestHelper = require('./note-api-test-helper');

const api = supertest(app);

beforeEach(async () => {
  await NoteModel.deleteMany({});

  await Promise.all(noteApiTestHelper.initialNotes.map((note) => new NoteModel(note).save()));
});

describe('when there is initially some notes saved', () => {
  test('notes are returned as JSON', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are all the initial notes', async () => {
    const response = await api.get('/api/notes');
    assert.strictEqual(response.body.length, noteApiTestHelper.initialNotes.length);
  });

  test('there is a note about HTML', async () => {
    const response = await api.get('/api/notes');
    const contents = response.body.map((r) => r.content);
    assert(contents.includes('HTML is easy'));
  });
});

describe('viewing a specific note', () => {
  test("a note's detailes can be viewed", async () => {
    const notesAtStart = await noteApiTestHelper.notesInDb();
    const noteToView = notesAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.deepStrictEqual(resultNote.body, noteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await noteApiTestHelper.nonExistingId();
    await api.get(`/api/notes/${validNonexistingId}`).expect(404);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = 'a';
    await api.get(`/api/notes/${invalidId}`).expect(400);
  });
});

describe('addition of a new note', () => {
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

    const notesAfter = await noteApiTestHelper.notesInDb();
    assert.strictEqual(notesAfter.length, noteApiTestHelper.initialNotes.length + 1);
    const contents = notesAfter.map((r) => r.content);

    assert(contents.includes('async/await simplifies making async calls'));
  });

  test('note without content is not added', async () => {
    const newNote = {
      important: true,
    };

    await api.post('/api/notes').send(newNote).expect(400);

    const notesAfter = await noteApiTestHelper.notesInDb();
    assert.strictEqual(notesAfter.length, noteApiTestHelper.initialNotes.length);
  });
});

describe('deletion of a note', () => {
  test('a note can be deleted', async () => {
    const notesBefore = await noteApiTestHelper.notesInDb();
    const noteToDelete = notesBefore[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const notesAfter = await noteApiTestHelper.notesInDb();
    assert.strictEqual(notesAfter.length, noteApiTestHelper.initialNotes.length - 1);

    const contents = notesAfter.map((r) => r.content);
    assert(!contents.includes(noteToDelete.content));
  });
  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await noteApiTestHelper.nonExistingId();
    await api.delete(`/api/notes/${validNonexistingId}`).expect(404);
  });
});

after(async () => {
  await mongoose.connection.close();
});
