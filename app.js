const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const socketio = require('socket.io');
const http = require('http');
const socket = require('./socket/socket');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const messagesRouter = require('./routes/messages');
const callsRouter = require('./routes/calls');

//Middlewares
//const cors = require('./middlewares/cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
socket.initialize(io, app);

require('./init/db')();

const corsOptions = {
  origin: '*',
  allowedHeaders:
    'Origin, X-Requested-With, Content-Type, Accept, Authentication, authorization',
  methods: 'GET,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/calls', callsRouter);

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

module.exports = app;
