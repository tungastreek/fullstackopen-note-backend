const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/user');
const CustomError = require('../utils/custom-error');

const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });
  const credentialCorrect = user && (await bcrypt.compare(password, user.passwordHash));
  if (!credentialCorrect) {
    throw new CustomError('Invalid username or password', 'AuthorizationError');
  }

  const userPayload = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userPayload, process.env.JWT_SECRET);
  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
