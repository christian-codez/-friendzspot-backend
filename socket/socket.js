module.exports.initialize = (io, app) => {
  io.on('connection', socket => {
    app.set('socket', socket);
    app.set('io', io);
  });

  io.on('disconnect', () => {
    console.log('user disconnected');
  });
};
// mongodb+srv://devxtian:dFKdrOkMzeQoPmy1@friendzspot-ztuc1.mongodb.net/friendzspot?retryWrites=true&w=majority
