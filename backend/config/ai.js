'use strict';

/**
 * AI provider configuration. Resolves the active provider and its settings,
 * plus per-feature credit costs.
 */
const env = require('./env');

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const toFloat = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

const providers = {
  openai: {
    name: 'openai',
    apiBaseUrl: process.env.AI_API_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.AI_API_KEY || '',
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o-mini',
    imageModel: process.env.AI_IMAGE_MODEL || 'dall-e-3',
  },
  openrouter: {
    name: 'openrouter',
    apiBaseUrl: process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
    imageModel: process.env.AI_IMAGE_MODEL || 'dall-e-3',
  },
  groq: {
    name: 'groq',
    apiBaseUrl: process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
    defaultModel: process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
    imageModel: process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
  },
  ollama: {
    name: 'ollama',
    apiBaseUrl: process.env.OLLAMA_API_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.OLLAMA_API_KEY || 'ollama',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1',
    imageModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1',
  },
};

const active = providers[env.AI_PROVIDER] ? env.AI_PROVIDER : 'openai';

const ai = {
  activeProvider: active,
  providers,
  // Active provider resolved settings (shorthand)
  apiBaseUrl: providers[active].apiBaseUrl,
  apiKey: providers[active].apiKey,
  defaultModel: providers[active].defaultModel,
  imageModel: providers[active].imageModel,
  temperature: toFloat(process.env.AI_TEMPERATURE, 0.7),
  maxTokens: toInt(process.env.AI_MAX_TOKENS, 2000),
  timeoutMs: 120 * 1000, // 120s AbortController
  // Per-feature credit costs
  costs: {
    chat: toInt(process.env.AI_CHAT_COST, 10),
    image: toInt(process.env.AI_IMAGE_COST, 50),
    video: toInt(process.env.AI_VIDEO_COST, 200),
    voice: toInt(process.env.AI_VOICE_COST, 80),
    music: toInt(process.env.AI_MUSIC_COST, 120),
    logo: toInt(process.env.AI_LOGO_COST, 60),
    resume: toInt(process.env.AI_RESUME_COST, 40),
    presentation: toInt(process.env.AI_PRESENTATION_COST, 90),
    pdf_summary: toInt(process.env.AI_PDF_SUMMARY_COST, 30),
    code: toInt(process.env.AI_CODE_COST, 20),
    website: toInt(process.env.AI_WEBSITE_COST, 100),
    app: toInt(process.env.AI_APP_COST, 150),
    email: toInt(process.env.AI_EMAIL_COST, 15),
    document: toInt(process.env.AI_DOCUMENT_COST, 25),
  },
  // The 14 supported generation types
  types: [
    'chat',
    'image',
    'video',
    'voice',
    'music',
    'logo',
    'resume',
    'presentation',
    'pdf_summary',
    'code',
    'website',
    'app',
    'email',
    'document',
  ],
};

module.exports = ai;
