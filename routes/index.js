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

router.get('/board/posts/new', (req, res) => {
  res.render('create');
});

router.post('/board/posts', async (req, res) => {
  const { title, content } = req.body;
  await Post.create({ title, content });
  res.redirect('/board');
});

router.get('/board/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('detail', { post });
});

module.exports = router;
