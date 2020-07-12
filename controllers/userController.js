const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { User } = require('../models/user');
const status = require('http-status');
const { generateToken } = require('../helpers/manage-tokens');
const { newError } = require('../helpers/error');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../helpers/manage-tokens');
const {
  socketUserConnected,
  socketUserDisconnected,
} = require('../helpers/socket-helpers');
const httpStatus = require('http-status');

//returns all existing users
exports.index = asyncMiddleware(async (req, res) => {
  const users = await User.users();
  if (users.length <= 0)
    throw newError('Users were not found', status.NOT_FOUND);

  res.send(users);
});

exports.single = asyncMiddleware(async (req, res) => {
  const user = await User.findUser(req);

  if (!user) throw newError('User was not found', status.NOT_FOUND);

  res.send(user);
});
exports.unFriend = asyncMiddleware(async (req, res) => {
  const user = await User.unFriend(req);

  if (!user) throw newError('User was not found', status.NOT_FOUND);

  res.send(user);
});
exports.checkIsOnline = asyncMiddleware(async (req, res) => {
  const reqUserId = req.params.id;
  const io = req.app.get('io');

  const { socketId } = await User.findSocketID(reqUserId);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      console.log('Found');
      res.status(httpStatus.OK).send({
        status: 'online',
        id: reqUserId,
      });
    } else {
      res.status(httpStatus.OK).send({
        status: 'offline',
        id: reqUserId,
      });
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }
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
exports.blockFriend = asyncMiddleware(async (req, res) => {
  const user = await User.blockFriend(req);

  if (!user)
    return res.status(status.BAD_REQUEST).send('Friend could not be blocked');

  res.send(user);
});
exports.getBlockedFriends = asyncMiddleware(async (req, res) => {
  const user = await User.getBlockedFriends(req);

  if (!user)
    return res.status(status.NOT_FOUND).send('Friends could not be found');

  res.send(user);
});
exports.unBlockFriend = asyncMiddleware(async (req, res) => {
  const user = await User.unBlockFriend(req);

  if (!user)
    return res.send('Friend could not be unblocked', status.BAD_REQUEST);

  res.send(user);
});

exports.people = asyncMiddleware(async (req, res) => {
  const user = await User.getPeople(req);

  if (!user) throw newError('User was not found', status.NOT_FOUND);

  res.send(user);
});

exports.logout = asyncMiddleware(async (req, res) => {
  const me = await User.findUser(req.params.id);
  const userId = me._id;
  const { socketId } = await User.findSocketID(userId);

  const user = await User.findUser(userId);
  user.lastseen = new Date();
  await user.save();

  socketUserDisconnected(req, userId, socketId);

  res.json(me);
});
exports.login = asyncMiddleware(async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (user.status === 'deactivated')
    throw newError(
      'Account not found. Please register a new account',
      status.BAD_REQUEST
    );

  if (user.status === 'suspended')
    throw newError('Account has been suspended', status.BAD_REQUEST);

  if (!user)
    throw newError('Login failed, wrong email/password', status.BAD_REQUEST);

  const match = bcrypt.compareSync(req.body.password, user.password);

  if (!match)
    throw newError('Login failed, wrong email/password', status.NOT_FOUND);

  const token = generateToken(user);

  socketUserConnected(req, user._id, user.socketId);

  res.json({ ...user._doc, token });
});
exports.updateSocketID = asyncMiddleware(async (req, res) => {
  const user = await User.updateSocketID(req);

  const socketId = user.socketId;
  const userId = user._id;

  socketUserConnected(req, userId, socketId);

  if (!user)
    throw newError('socket Id could not be updated!', status.BAD_REQUEST);

  res.json(user);
});

exports.loginToken = asyncMiddleware(async (req, res) => {
  const user = await verifyToken(req.params.token);
  const userObject = await User.findUser(user.id);
  res.json(userObject);
});

exports.updateProfilePhoto = asyncMiddleware(async (req, res) => {
  const user = await User.updateProfilePhoto(req);

  if (!user)
    throw newError('Could not update user profile photo', status.BAD_REQUEST);

  res.json(user);
});
exports.updateCoverPhoto = asyncMiddleware(async (req, res) => {
  const user = await User.updateCoverPhoto(req);

  if (!user)
    throw newError('Could not update user cover photo', status.BAD_REQUEST);

  res.json(user);
});

exports.create = asyncMiddleware(async (req, res) => {
  //register new user
  const user = await User.register(req);

  if (!user)
    throw newError('Could not update user cover photo', status.BAD_REQUEST);

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
exports.updateMe = asyncMiddleware(async (req, res) => {
  const user = await User.updateMe(req);
  res.send(user);
});

exports.delete = asyncMiddleware(async (req, res) => {
  const user = await User.deleteUser(req);
  if (!user) throw new Error('user could not be deleted', status.BAD_REQUEST);

  res.send(user);
});
exports.deactivateMyAccount = asyncMiddleware(async (req, res) => {
  const user = await User.deactivateMyAccount(req);
  if (!user)
    throw new Error('Account could not be deativated!', status.BAD_REQUEST);

  res.send(user);
});
