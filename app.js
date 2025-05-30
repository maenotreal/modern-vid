var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

const {initializeApp} = require('firebase-admin/app');
const {getStorage} = require('firebase-admin/storage');


//dotenv access
require('dotenv')
    .config('/.env');

var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

var indexRouter = require('./routes/index');
// ====================== VIDEO PLAYER ROUTE =========================
// Registering the video player route (uses Firebase + MongoDB):
// Route: /player/:videoId
// Logic file: routes/player.js
// Streams video from Firebase Storage, metadata cached in MongoDB (VideoCache)
// Used together with Video.js frontend (views/player.ejs)
// ===================================================================
const playerRouter = require('./routes/player');

const uploadRouter = require('./routes/upload');// ← added
const searchRouter = require('./routes/search');

var usersRouter = require('./routes/users');
var registrationRouter = require('./routes/registration');
var loginRouter = require('./routes/login');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);


//mongoDB connection setup
mongoose.connect(process.env.MONGODB_URI);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/registration', registrationRouter);
app.use('/login', loginRouter);
app.use('/player', playerRouter);

app.use('/upload', uploadRouter);   // ← added
app.use('/search', searchRouter); 
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
module.exports = {
  app,
  firebaseStorage
}