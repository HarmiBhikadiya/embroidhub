//definr API endpoints (ENTERY/URL)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.get('/users', authenticate, roleCheck('Admin'), authController.getAllUsers);

module.exports = router;
