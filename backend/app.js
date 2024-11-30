var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var cors = require('cors');
var fileUpload = require('express-fileupload');

require('./plugins/express-async-error');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/authenticate');
var guestRouter = require('./routes/guest');
var meetingRouter = require('./routes/meeting');
var attendanceRouter = require('./routes/attendance');
const { verifyAuthorization } = require('./utils/auth-utils');
const { DEFAULT_SETTINGS } = require('./config');

dotenv.config({
  path: '.env',
});

mongoose.connect(process.env.ENV_MONGO_URI);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/photo', express.static(DEFAULT_SETTINGS.photoPath));
app.use(
  fileUpload({
    limits: { fileSize: 128 * 1024 * 1024 },
  })
);

app.use('/', indexRouter);

var api = express.Router();
api.use('/auth', authRouter);

api.use(async function (req, res, next) {
  try {
    const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
    const mid = Math.floor(tokenSalt.length / 2);
    await verifyAuthorization(req.headers.authorization, tokenSalt.slice(0, mid));
    next();
  } catch (ex) {
    next(ex);
  }
});

api.use('/guest', guestRouter);
api.use('/meeting', meetingRouter);
api.use('/attendance', attendanceRouter);

app.use('/api/v1', api);

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
  console.error(err);
  res.status(err.status || 500);
  res.json({ status: 'error', message: err.message });
});

module.exports = app;
