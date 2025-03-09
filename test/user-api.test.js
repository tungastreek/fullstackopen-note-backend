const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');

const UserModel = require('../src/models/user');
const { initialUsers, usersInDb } = require('./user-api-test-helper');

const app = require('../src/app');
const api = supertest(app);

describe('User API', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    await Promise.all(initialUsers.map((user) => new UserModel(user).save()));
  });

  describe('GET /api/users', () => {
    test('returns all users', async () => {
      const users = await api.get('/api/users');
      assert.strictEqual(users.status, 200);
      assert.match(users.headers['content-type'], /application\/json/);
      assert.strictEqual(users.body.length, initialUsers.length);
    });
  });

  describe('POST /api/users', () => {
    test('succeeds with valid user data', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'password',
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      assert(usernames.includes(newUser.username));
    });

    test('fails with status code 400 if username already exists', async () => {
      const existingUser = initialUsers[0];
      const duplicateUser = {
        username: existingUser.username,
        name: 'Test User',
        password: 'password',
      };

      await api
        .post('/api/users')
        .send(duplicateUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
