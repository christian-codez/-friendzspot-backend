const { asyncMiddleware } = require('../middlewares/asyncMiddleware');
const { User } = require('../models/user');
const { Message } = require('../models/messages');

exports.audioCallInitiated = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const callData = req.body.callInfo;

  const { socketId } = await User.findSocketID(callData.receiverID);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('incomingCall', {
        signalData: callData.signalData,
        callerId: callData.callerId,
        callerName: callData.callerName,
      });
      const messageResponse = await Message.sendFriendMessage(
        callData.callerId,
        callData.receiverID,
        `${new Date()}`,
        'call'
      );
    } else {
      io.sockets.connected[callData.socketID].emit(
        'receiverNotAvailable',
        'User is not online '
      );
    }
  } catch (error) {
    console.log(error);
  }

  res.send(callData);
});
exports.audioCallAccepted = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const acceptInfo = req.body.acceptInfo;

  const { socketId } = await User.findSocketID(acceptInfo.receiverId);

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
exports.callEnded = asyncMiddleware(async (req, res) => {
  const io = req.app.get('io');
  const receiverID = req.params.receiverID;

  const { socketId } = await User.findSocketID(receiverID);

  try {
    if (io.sockets.sockets[socketId] != undefined) {
      io.sockets.connected[socketId].emit('callEnded');
    } else {
      console.log('Socket not connected');
    }
  } catch (error) {
    console.log(error);
  }

  res.send('Call Ended');
});
