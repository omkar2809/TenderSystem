// ==========lib files===============

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var mongoose = require('mongoose');

// ==================================

// ==========Utility files===========

var config  = require('./util/config');
var auth = require('./util/authenticate');

// ===================================

// =========Router Files=============

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// ===================================

//=========MongoDB Setup===========

const url = config.mongoUrl;
const connect = mongoose.connect(url, { 
  useNewUrlParser: true,
  useUnifiedTopology: true, 
  useCreateIndex: true 
});

connect.then((db) => {
  console.log('DB Connected correctly to server');
}, (err) => {console.log(err);});

//=================================

var app = express();


//===========Https==========
app.all('*', (req, res, next) => {
  if(req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
// =========================

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'session-id',
  secret: config.secretKey,
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());

//===========Routers=================

app.use('/', indexRouter);
app.use('/users', usersRouter);

//====================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
