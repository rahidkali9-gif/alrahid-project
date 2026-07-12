'use strict';

/**
 * Reusable express-validator chains for common fields.
 */
const { body, query } = require('express-validator');

const passwordRules = [
  body('password')
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];

const emailRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name is required (2-80 chars)'),
  ...emailRules,
  ...passwordRules,
];

const forgotPasswordRules = [...emailRules];

const resetPasswordRules = [
  body('token').isString().notEmpty().withMessage('Token is required'),
  ...passwordRules,
];

const changePasswordRules = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  ...passwordRules,
];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt().withMessage('limit must be 1-200'),
  query('sort').optional().isString().trim(),
  query('order').optional().isString().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

const apiKeyCreateRules = [
  body('name').optional().isString().trim().isLength({ max: 120 }),
];

const notificationCreateRules = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('message').isString().trim().isLength({ min: 1, max: 2000 }),
  body('type').optional().isString().isIn(['info', 'success', 'warning', 'error']),
];

const aiChatRules = [
  body('prompt').isString().trim().isLength({ min: 1, max: 8000 }),
  body('model').optional().isString().trim(),
  body('temperature').optional().isFloat({ min: 0, max: 2 }).toFloat(),
  body('maxTokens').optional().isInt({ min: 1, max: 16000 }).toInt(),
];

const aiImageRules = [
  body('prompt').isString().trim().isLength({ min: 1, max: 4000 }),
  body('size').optional().isString().isIn(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']),
  body('n').optional().isInt({ min: 1, max: 4 }).toInt(),
];

const aiGenericRules = [
  body('prompt').isString().trim().isLength({ min: 1, max: 12000 }),
  body('model').optional().isString().trim(),
  body('context').optional().isString().trim().isLength({ max: 12000 }),
];

const walletAdjustRules = [
  body('userId').isString().notEmpty(),
  body('amount').isInt({ min: 1, max: 1000000000 }).toInt(),
  body('type').isString().isIn(['credit', 'debit']),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
];

module.exports = {
  passwordRules,
  emailRules,
  loginRules,
  registerRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  paginationRules,
  apiKeyCreateRules,
  notificationCreateRules,
  aiChatRules,
  aiImageRules,
  aiGenericRules,
  walletAdjustRules,
};
