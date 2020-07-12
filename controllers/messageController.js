const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { Message } = require('../models/messages');
const status = require('http-status');
const { newError } = require('../helpers/error');
const { User } = require('../models/user');

//returns all existing users
exports.index = asyncMiddleware(async (req, res) => {});
exports.sendFriendMessage = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const socket = req.app.get('socket');

  const receiver = req.body.receiverID;
  const sender = req.body.senderID;
  const message = req.body.message;

  const messageResponse = await Message.sendFriendMessage(
    sender,
    receiver,
    message
  );

  if (!messageResponse)
    throw newError('Message could not be sent', status.BAD_REQUEST);

  const { socketId } = await User.findSocketID(receiver);
  const userInfo = await User.findSocketID(req.user.id);
  const mySocketID = userInfo.socketId;

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('new message', messageResponse);
    } else {
      //SAVE THIS MESSAGE IN A PENDING BUFFER AND WHEN THE USER LOGS IN. TRY TO RESEND THE MESSAGE TO THEM
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send(messageResponse);
});
exports.getUserMessages = asyncMiddleware(async (req, res) => {
  const receiver = req.body.receiverID;
  const sender = req.body.senderID;

  const messages = await Message.getUserMessages(sender, receiver);

  if (!messages)
    throw newError('Message could not be retrieved', status.NOT_FOUND);

  res.send(messages);
});
exports.getLastUserMessages = asyncMiddleware(async (req, res) => {
  const messages = await Message.getLastUserMessages(req);

  if (!messages)
    throw newError('Message could not be retrieved', status.NOT_FOUND);

  res.send(messages);
});
exports.clearChatHistory = asyncMiddleware(async (req, res) => {
  const messages = await Message.clearChatHistory(req);

  if (!messages)
    throw newError('Messages could not be cleared', status.BAD_REQUEST);

  res.send(messages);
});

exports.typingStarted = asyncMiddleware(async (req, res) => {
  const friendId = req.body.uuid;
  const myId = req.user.id;

  const messageInfo = { friendId: req.body.uuid, myId: req.user.id };

  const io = req.app.get('io');

  const { socketId } = await User.findSocketID(friendId);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('started typing', myId);
    } else {
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send(socketId);
});

exports.typingStopped = asyncMiddleware(async (req, res) => {
  const friendId = req.body.uuid;
  const myId = req.user.id;

  const messageInfo = { friendId: req.body.uuid, myId: req.user.id };

  const io = req.app.get('io');

  const { socketId } = await User.findSocketID(friendId);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('stopped typing', myId);
      console.log('Event Emitted');
    } else {
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send(socketId);
});
