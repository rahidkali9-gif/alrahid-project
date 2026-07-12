'use strict';

/**
 * AI service — orchestrates wallet charging, provider calls, generation
 * records, and refunds on failure. Exposes 14 feature methods.
 */
const ai = require('../config/ai');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const models = require('../models');
const aiProvider = require('./aiProvider');

const FEATURE_TO_TYPE = {
  chat: 'chat',
  image: 'image',
  video: 'video',
  voice: 'voice',
  music: 'music',
  logo: 'logo',
  resume: 'resume',
  presentation: 'presentation',
  pdf_summary: 'pdf_summary',
  code: 'code',
  website: 'website',
  app: 'app',
  email: 'email',
  document: 'document',
};

function costFor(type) {
  return ai.costs[type] || 0;
}

/**
 * Core runner: charge credits -> call provider -> record result.
 * On provider failure, refund the charged credits.
 */
async function runGeneration(userId, type, prompt, { provider = null, model = null, messages = null, imageParams = null, temperature, maxTokens, context = null } = {}) {
  if (!FEATURE_TO_TYPE[type]) throw ApiError.badRequest(`Unknown AI type: ${type}`);

  // Check feature toggle
  const toggleKey = `ai_${type}`;
  const enabled = await models.FeatureToggle.isEnabled(toggleKey);
  if (enabled === false) {
    throw ApiError.forbidden(`Feature '${type}' is currently disabled`);
  }

  const cost = costFor(type);

  // Create generation record (pending)
  const gen = await models.AiGeneration.create({
    userId,
    type,
    prompt,
    model: model || null,
    provider: provider || ai.activeProvider,
    cost,
  });

  // Charge credits up-front
  try {
    await models.Wallet.debit(userId, cost, {
      reason: `AI ${type} generation`,
      referenceType: 'ai_generation',
      referenceId: gen.id,
      extraMeta: { type },
    });
  } catch (err) {
    await models.AiGeneration.updateStatus(gen.id, 'failed', { errorMessage: err.message });
    throw err;
  }

  await models.AiGeneration.updateStatus(gen.id, 'processing');

  const start = Date.now();
  try {
    let result;
    if (type === 'image') {
      result = await aiProvider.generateImage({
        prompt,
        size: imageParams && imageParams.size,
        n: imageParams && imageParams.n,
        model,
        provider,
      });
    } else {
      const msgs = messages || buildMessages(type, prompt, { context, temperature, maxTokens });
      result = await aiProvider.chatCompletion({ messages: msgs, model, temperature, maxTokens, provider });
    }
    const durationMs = Date.now() - start;

    await models.AiGeneration.updateStatus(gen.id, 'succeeded', {
      result: { ...result, raw: undefined },
      tokensUsed: result.tokensUsed,
      durationMs,
      model: result.model,
    });

    // record history
    await models.History.create({
      userId,
      category: 'ai',
      action: type,
      title: `${type} generation`,
      summary: prompt.slice(0, 200),
      metadata: { generationId: gen.id, cost, model: result.model },
    });

    return {
      generationId: gen.id,
      type,
      cost,
      ...result,
      raw: undefined,
    };
  } catch (err) {
    // Refund on failure
    try {
      await models.Wallet.credit(userId, cost, {
        reason: `Refund: AI ${type} failed`,
        referenceType: 'ai_generation',
        referenceId: gen.id,
        extraMeta: { error: err.message },
      });
      await models.AiGeneration.updateStatus(gen.id, 'refunded', { errorMessage: err.message });
    } catch (refundErr) {
      logger.error('Refund failed', { generationId: gen.id, error: refundErr.message });
      await models.AiGeneration.updateStatus(gen.id, 'failed', { errorMessage: err.message });
    }
    throw err;
  }
}

function buildMessages(type, prompt, { context = null } = {}) {
  const sysByType = {
    chat: 'You are Al Rahid, a helpful AI assistant.',
    video: 'You are an AI video producer. Provide a detailed video script and scene descriptions for the request.',
    voice: 'You are an AI voice script writer. Produce a narration script with tone and pacing notes.',
    music: 'You are an AI music composer. Provide lyrics, chord progression, and arrangement suggestions.',
    logo: 'You are an AI logo designer. Provide a detailed logo concept description, colors, and layout.',
    resume: 'You are an expert resume writer. Produce a polished, ATS-friendly resume in markdown.',
    presentation: 'You are an AI presentation designer. Produce a slide-by-slide outline with speaker notes.',
    pdf_summary: 'You are a document summarizer. Provide a concise summary, key points, and takeaways.',
    code: 'You are an expert software engineer. Provide production-ready, well-commented code.',
    website: 'You are an AI website builder. Provide a complete HTML/CSS/JS structure and content.',
    app: 'You are an AI app architect. Provide architecture, features, and starter code.',
    email: 'You are an expert email writer. Write clear, professional emails.',
    document: 'You are an AI document writer. Produce a well-structured document.',
  };
  const messages = [
    { role: 'system', content: sysByType[type] || 'You are a helpful AI assistant.' },
  ];
  if (context) messages.push({ role: 'system', content: `Context: ${context}` });
  messages.push({ role: 'user', content: prompt });
  return messages;
}

// ── 14 feature methods ───────────────────────────────────────
async function chat(userId, prompt, opts = {}) {
  return runGeneration(userId, 'chat', prompt, opts);
}
async function image(userId, prompt, opts = {}) {
  return runGeneration(userId, 'image', prompt, { ...opts, imageParams: { size: opts.size, n: opts.n } });
}
async function video(userId, prompt, opts = {}) {
  return runGeneration(userId, 'video', prompt, opts);
}
async function voice(userId, prompt, opts = {}) {
  return runGeneration(userId, 'voice', prompt, opts);
}
async function music(userId, prompt, opts = {}) {
  return runGeneration(userId, 'music', prompt, opts);
}
async function logo(userId, prompt, opts = {}) {
  return runGeneration(userId, 'logo', prompt, opts);
}
async function resume(userId, prompt, opts = {}) {
  return runGeneration(userId, 'resume', prompt, opts);
}
async function presentation(userId, prompt, opts = {}) {
  return runGeneration(userId, 'presentation', prompt, opts);
}
async function pdfSummary(userId, prompt, opts = {}) {
  return runGeneration(userId, 'pdf_summary', prompt, opts);
}
async function code(userId, prompt, opts = {}) {
  return runGeneration(userId, 'code', prompt, opts);
}
async function website(userId, prompt, opts = {}) {
  return runGeneration(userId, 'website', prompt, opts);
}
async function app(userId, prompt, opts = {}) {
  return runGeneration(userId, 'app', prompt, opts);
}
async function email(userId, prompt, opts = {}) {
  return runGeneration(userId, 'email', prompt, opts);
}
async function document(userId, prompt, opts = {}) {
  return runGeneration(userId, 'document', prompt, opts);
}

module.exports = {
  runGeneration,
  buildMessages,
  costFor,
  chat,
  image,
  video,
  voice,
  music,
  logo,
  resume,
  presentation,
  pdfSummary,
  code,
  website,
  app,
  email,
  document,
  types: ai.types,
};
