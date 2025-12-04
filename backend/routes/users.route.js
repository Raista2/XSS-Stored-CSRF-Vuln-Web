// users.route.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { csrfProtection } = require('../middleware/csrf.middleware');

// Auth routes (login tidak perlu CSRF karena belum ada session)
router.post('/login', usersController.login);
router.post('/logout', csrfProtection, usersController.logout);
router.get('/me', usersController.getMe);

// User management routes (butuh CSRF protection)
router.post('/change-email', csrfProtection, usersController.changeEmail);

module.exports = router;
