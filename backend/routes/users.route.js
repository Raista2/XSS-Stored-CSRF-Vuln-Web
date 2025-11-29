// users.route.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// Auth routes
router.post('/login', usersController.login);
router.post('/logout', usersController.logout);
router.get('/me', usersController.getMe);

// User management routes
router.post('/change-email', usersController.changeEmail);

module.exports = router;
