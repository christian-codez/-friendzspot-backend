const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { User } = require('../models/user');
const status = require('http-status');
const { generateToken } = require('../helpers/manage-tokens');
const { newError } = require('../helpers/error');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../helpers/manage-tokens');

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
exports.getFriends = asyncMiddleware(async (req, res) => {
  const friends = await User.getFriends(req);

  if (friends.length <= 0)
    throw newError('Friends could not be found!', status.NOT_FOUND);

  res.send(friends);
});

exports.acceptFriendRequest = asyncMiddleware(async (req, res) => {
  const user = await User.acceptFriendRequest(req);

  if (user.friends.length <= 0)
    throw newError('Friends could not be added', status.NOT_FOUND);

  res.send(user);
});
exports.people = asyncMiddleware(async (req, res) => {
  const user = await User.getPeople(req);

  if (!user) throw newError('User was not found', status.NOT_FOUND);

  res.send(user);
});

exports.login = asyncMiddleware(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw newError('Login failed, wrong email/password', status.NOT_FOUND);

  const match = bcrypt.compareSync(req.body.password, user.password);

  if (!match)
    throw newError('Login failed, wrong email/password', status.NOT_FOUND);

  const token = generateToken(user);

  res.json({ ...user._doc, token });
});
exports.updateSocketID = asyncMiddleware(async (req, res) => {
  const user = await User.updateSocketID(req);

  if (!user)
    throw newError('Login failed, wrong email/password', status.NOT_FOUND);

  res.json(user);
});

exports.loginToken = asyncMiddleware(async (req, res) => {
  const user = await verifyToken(req.params.token);
  res.json(user);
});

exports.create = asyncMiddleware(async (req, res) => {
  //register new user
  const user = await User.register(req);

  if (!user) throw new Error('user could not be created!', status.BAD_REQUEST);

  //generate token
  const token = generateToken(user);

  //send response to the user
  res.status(status.CREATED).send({ ...user._doc, token });
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
