const UserModel = require('../src/models/user');
const bcrypt = require('bcrypt');

const initialUsers = [
  {
    username: 'root',
    name: 'superuser',
    passwordHash: bcrypt.hashSync('sekret', 10),
  },
  {
    username: 'root2',
    name: 'superuser2',
    passwordHash: bcrypt.hashSync('sekret2', 10),
  },
];

const usersInDb = async () => {
  const users = await UserModel.find({});
  return users.map((u) => u.toJSON());
};

module.exports = { usersInDb, initialUsers };
