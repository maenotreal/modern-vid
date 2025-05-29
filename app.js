require('dotenv')
  .config('/.env');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sing_upRouter = require('./routes/sign_up');
var sing_inRouter = require('./routes/sign_in');

const videoRouter = require('./routes/video');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');


var app = express();

// Firebase and MongoDB setup
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

mongoose.connect(process.env.MONGODB_URL,  {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Автоочистка кеша
const VideoCache = require('./models/VideoCache');

setInterval(async () => {
  await VideoCache.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { lastAccessed: { $lt: new Date(Date.now() - 3600000) } }
    ]
  });
}, 3600000);

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports.firebaseApp = firebaseApp;
module.exports.firebaseStorage = storage;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sign_up', sing_upRouter);
app.use('/sign_in', sing_inRouter);

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
