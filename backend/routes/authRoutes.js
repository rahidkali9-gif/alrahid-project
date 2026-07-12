'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { auth: authLimiter } = require('../middleware/rateLimit');
const v = require('../utils/validators');

router.post('/register', authLimiter, v.registerRules, validate, authController.register);
router.post('/login', authLimiter, v.loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/forgot-password', authLimiter, v.forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, v.resetPasswordRules, validate, authController.resetPassword);
router.post('/change-password', authenticate, v.changePasswordRules, validate, authController.changePassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
