// posts.route.js
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const { csrfProtection } = require('../middleware/csrf.middleware');

// Posts routes
router.get('/posts', postsController.getAllPosts);
router.post('/post', csrfProtection, postsController.createPost); // CSRF protection
router.delete('/post/:id', csrfProtection, postsController.deletePost); // CSRF protection

module.exports = router;
