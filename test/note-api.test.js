const { test, after } = require('node:test');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('../src/app');

const api = supertest(app);

test('notes are returned as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

after(async () => {
  await mongoose.connection.close();
});

