const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { User } = require('../models/user');
const status = require('http-status');
const { generateToken } = require('../helpers/manage-tokens');
const { newError } = require('../helpers/error');

//returns all existing users
exports.index = asyncMiddleware(async (req, res) => {
  const users = await User.users();

  if (users.length <= 0)
    throw newError('Users was not found', status.NOT_FOUND);

  res.send(users);
});

exports.single = asyncMiddleware(async (req, res) => {
  const user = await User.findUser(req);

  if (!user) throw newError('User was not found', status.NOT_FOUND);

  res.send(user);
});

exports.create = asyncMiddleware(async (req, res) => {
  //register new user
  const user = await User.register(req);

  if (!user) throw new Error('user could not be created!', status.BAD_REQUEST);

  //generate token
  const token = generateToken(user);

  //send response to the user
  res.header({ authorization: token }).status(status.CREATED).send(user);
});

exports.update = asyncMiddleware(async (req, res) => {
  const updatedUser = await User.updateUser(req);
  if (!updatedUser)
    throw new Error('User could not be updated.', status.BAD_REQUEST);

  const token = generateToken(updatedUser);
  res.header({ authorization: token }).send(updatedUser);
});

exports.delete = asyncMiddleware(async (req, res) => {
  const user = await User.deleteUser(req);
  if (!user) throw new Error('user could not be deleted', status.BAD_REQUEST);

  res.send(user);
});
