'use strict';

/**
 * ApiResponse — helpers that produce consistent JSON envelopes:
 *   { success, message, data, meta }
 */

class ApiResponse {
  static success(res, message = 'OK', data = null, meta = null, status = 200) {
    return res.status(status).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static created(res, message = 'Created', data = null, meta = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static noContent(res) {
    return res.status(204).json({
      success: true,
      message: 'No content',
      data: null,
      meta: null,
    });
  }

  static error(res, message = 'Error', status = 500, code = null, details = null) {
    return res.status(status).json({
      success: false,
      message,
      error: {
        code: code || 'ERROR',
        ...(details ? { details } : {}),
      },
      data: null,
      meta: null,
    });
  }

  static paginated(res, message = 'OK', data = [], meta = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  }
}

module.exports = ApiResponse;
