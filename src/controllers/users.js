const { Router } = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const UserModel = require('../models/user');
const { validateWith } = require('../utils/middleware');

const userCreateSchema = Joi.object({
  username: Joi.string().min(3).required(),
  name: Joi.string().min(3).required(),
  password: Joi.string().min(5).required(),
});

const usersRouter = Router();

usersRouter.get('/', async (req, res) => {
  const users = await UserModel.find({}).populate('notes', { content: 1, important: 1 });
  res.json(users);
});

usersRouter.post('/', validateWith(userCreateSchema), async (req, res) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(req.body.password, salt);

  const user = new UserModel({
    username: req.body.username,
    name: req.body.name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = usersRouter;
