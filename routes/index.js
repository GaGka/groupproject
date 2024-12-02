var express = require('express');
var router = express.Router();
var static = require('serve-static');
var path = require('path');
const Post = require('../models/Post');

/* GET 메인화면 */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET 게시판 */
router.get('/board', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.render('board', { posts });
});

/* GET 게시판 글 작성 */
router.get('/board/posts/new', (req, res) => {
  res.render('create');
});

/* 게시판 글 작성 화면 및 작성 후 경로 */
router.post('/board/posts', async (req, res) => {
  const { title, content } = req.body;
  await Post.create({ title, content });
  res.redirect('/board');
});

/* GET 작성한 글 열람 */
router.get('/board/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('detail', { post });
});

module.exports = router;
