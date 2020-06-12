const { User } = require('../models/user');

module.exports.socketUserConnected = async (req, userId, socketId) => {
  const io = req.app.get('io');
  const friends = await User.getFriendsBasedOnSocketId(socketId);

  if (friends) {
    //Emit events to all friends
    friends.friends.forEach(friend => {
      console.log(friend.socketId);
      //if friends socket connect is still valid
      if (io.sockets.sockets[friend.socketId] != undefined) {
        //emit an event to the particular socket
        io.sockets.connected[friend.socketId].emit('user connected', userId);
      }
    });
  }
};
module.exports.socketUserDisconnected = async (req, userId, socketId) => {
  const io = req.app.get('io');
  const friends = await User.getFriendsBasedOnSocketId(socketId);

  if (friends) {
    //Emit events to all friends
    friends.friends.forEach(friend => {
      console.log(friend.socketId);
      //if friends socket connect is still valid
      if (io.sockets.sockets[friend.socketId] != undefined) {
        //emit an event to the particular socket
        io.sockets.connected[friend.socketId].emit('user disconnected', userId);
      }
    });
  }
};
