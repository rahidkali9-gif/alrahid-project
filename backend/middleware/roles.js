'use strict';

/**
 * RBAC middleware.
 * - authorize(...roles): requires the authenticated user to have one of the roles.
 * - superAdminOnly: restricts to super_admin.
 */
const ApiError = require('../utils/ApiError');

function authorize(...roles) {
  if (!roles.length) roles = ['user', 'admin', 'super_admin'];
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions', { required: roles, current: req.user.role }));
    }
    next();
  };
}

function superAdminOnly(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized('Authentication required'));
  if (req.user.role !== 'super_admin') {
    return next(ApiError.forbidden('Super admin only'));
  }
  next();
}

module.exports = {
  authorize,
  superAdminOnly,
};
