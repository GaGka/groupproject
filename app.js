// 모듈 변수 설정
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Post = require('./models/Post');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

var indexRouter = require('./routes/index');


var app = express();

// MongoDB 연결
mongoose
  .connect('mongodb://localhost:27017', 
    { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 50000, socketTimeoutMS: 45000, })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// pug로 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


// 404에러 발견, 에러 처리
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 처리
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 에러 페이지 표시
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.handler = serverless(app);