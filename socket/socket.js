module.exports.initialize = (io, app) => {
  io.on('connection', socket => {
    socket.emit('message', 'Message from socket');
    app.set('socket', socket);
    app.set('io', io);
  });
};
// mongodb+srv://devxtian:dFKdrOkMzeQoPmy1@friendzspot-ztuc1.mongodb.net/friendzspot?retryWrites=true&w=majority
