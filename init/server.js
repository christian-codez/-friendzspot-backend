const http = require('http');
const socketio = require('socket.io');
const socket = require('../socket/socket');
const config = require('config');

const Server = app => {
  const server = http.createServer(app);
  const io = socketio(server);
  socket.initialize(io, app);
  const port = process.env.PORT || config.get('port');
  return server.listen(port);
};

module.exports = Server;
