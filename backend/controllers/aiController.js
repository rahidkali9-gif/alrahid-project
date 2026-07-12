'use strict';

/**
 * AI controller — 14 feature endpoints.
 */
const aiService = require('../services/aiService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

function opts(req) {
  return {
    model: req.body.model,
    temperature: req.body.temperature,
    maxTokens: req.body.maxTokens,
    context: req.body.context,
    size: req.body.size,
    n: req.body.n,
    provider: req.body.provider,
  };
}

exports.chat = asyncHandler(async (req, res) => {
  const result = await aiService.chat(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Chat generation complete', result);
});

exports.image = asyncHandler(async (req, res) => {
  const result = await aiService.image(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Image generation complete', result);
});

exports.video = asyncHandler(async (req, res) => {
  const result = await aiService.video(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Video generation complete', result);
});

exports.voice = asyncHandler(async (req, res) => {
  const result = await aiService.voice(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Voice generation complete', result);
});

exports.music = asyncHandler(async (req, res) => {
  const result = await aiService.music(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Music generation complete', result);
});

exports.logo = asyncHandler(async (req, res) => {
  const result = await aiService.logo(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Logo generation complete', result);
});

exports.resume = asyncHandler(async (req, res) => {
  const result = await aiService.resume(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Resume generation complete', result);
});

exports.presentation = asyncHandler(async (req, res) => {
  const result = await aiService.presentation(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Presentation generation complete', result);
});

exports.pdfSummary = asyncHandler(async (req, res) => {
  const result = await aiService.pdfSummary(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'PDF summary complete', result);
});

exports.code = asyncHandler(async (req, res) => {
  const result = await aiService.code(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Code generation complete', result);
});

exports.website = asyncHandler(async (req, res) => {
  const result = await aiService.website(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Website generation complete', result);
});

exports.app = asyncHandler(async (req, res) => {
  const result = await aiService.app(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'App generation complete', result);
});

exports.email = asyncHandler(async (req, res) => {
  const result = await aiService.email(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Email generation complete', result);
});

exports.document = asyncHandler(async (req, res) => {
  const result = await aiService.document(req.user.id, req.body.prompt, opts(req));
  return ApiResponse.success(res, 'Document generation complete', result);
});

exports.history = asyncHandler(async (req, res) => {
  const models = require('../models');
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const result = await models.AiGeneration.listByUser(req.user.id, {
    page,
    limit,
    type: req.query.type || null,
  });
  return ApiResponse.paginated(res, 'AI history fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.types = asyncHandler(async (req, res) => {
  const ai = require('../config/ai');
  return ApiResponse.success(res, 'AI types and costs', {
    types: ai.types,
    costs: ai.costs,
    activeProvider: ai.activeProvider,
  });
});
