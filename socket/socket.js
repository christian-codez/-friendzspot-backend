module.exports.startSocketConnection = (io, app) => {
  io.on('connection', socket => {
    console.log('new web socket connection');
    socket.emit('message', 'Message from socket');
    app.set('socket', socket);
    app.set('io', io);
  });
};
