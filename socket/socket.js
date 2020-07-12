module.exports.initialize = (io, app) => {
  io.on('connection', socket => {
    //Set these two objects so it can be accessible throughout the app (Esp. in the controllers)
    app.set('socket', socket);
    app.set('io', io);
  });

  io.on('disconnect', () => {
    console.log('user disconnected');
  });
};
