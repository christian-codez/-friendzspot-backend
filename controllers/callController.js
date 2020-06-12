const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { Message } = require('../models/messages');
const status = require('http-status');
const { newError } = require('../helpers/error');
const { User } = require('../models/user');

exports.audioCallInitiated = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const callInfo = req.body.callInfo;

  const { socketId } = await User.findSocketID(callInfo.userToCall);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('incomingCall', callInfo);
    } else {
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send(callInfo);
});
exports.audioCallAccepted = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const acceptInfo = req.body.acceptInfo;

  const { socketId } = await User.findSocketID(acceptInfo.to);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('callAccepted', acceptInfo.signal);
    } else {
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send(acceptInfo);
});
