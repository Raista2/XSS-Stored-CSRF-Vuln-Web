// posts.route.js
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');

// Posts routes
router.get('/posts', postsController.getAllPosts);
router.post('/post', postsController.createPost);
router.delete('/post/:id', postsController.deletePost);

module.exports = router;
