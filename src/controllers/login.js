const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/user');

const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });
  const credentialCorrect = user && (await bcrypt.compare(password, user.passwordHash));
  if (!credentialCorrect) {
    throw new Error('Invalid username or password');
  }

  const userPayload = {
    username: user.username,
    name: user.name,
  };

  const token = jwt.sign(userPayload, process.env.JWT_SECRET);
  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
