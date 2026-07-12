'use strict';

/**
 * AI provider service — calls OpenAI-compatible endpoints via fetch.
 * Supports openai, openrouter, groq, ollama. 120s AbortController timeout.
 *
 * Public:
 *   - chatCompletion({ messages, model, temperature, maxTokens, provider })
 *   - generateImage({ prompt, size, n, model, provider })
 */
const ai = require('../config/ai');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const models = require('../models');

const TIMEOUT_MS = ai.timeoutMs;

function resolveProvider(providerName) {
  const name = providerName || ai.activeProvider;
  const provider = ai.providers[name];
  if (!provider) throw ApiError.badRequest(`Unknown AI provider: ${name}`);
  return { name, ...provider };
}

function buildHeaders(provider) {
  const headers = { 'Content-Type': 'application/json' };
  if (provider.apiKey && provider.apiKey !== 'ollama') {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }
  if (provider.name === 'openrouter') {
    headers['HTTP-Referer'] = 'https://alrahid.com';
    headers['X-Title'] = 'Al Rahid';
  }
  return headers;
}

function withTimeout(signal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (signal) {
    // also respect external signal
    if (signal.aborted) ctrl.abort();
    signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  return { signal: ctrl.signal, clear: () => clearTimeout(timer) };
}

async function chatCompletion({ messages, model, temperature, maxTokens, provider } = {}) {
  const p = resolveProvider(provider);
  const url = `${p.apiBaseUrl.replace(/\/$/, '')}/chat/completions`;
  const body = {
    model: model || p.defaultModel,
    messages,
    temperature: temperature !== undefined ? temperature : ai.temperature,
    max_tokens: maxTokens !== undefined ? maxTokens : ai.maxTokens,
  };
  const { signal, clear } = withTimeout();
  const start = Date.now();
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(p),
      body: JSON.stringify(body),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw ApiError.internal(`AI provider error ${resp.status}: ${text.slice(0, 500)}`);
    }
    const data = await resp.json();
    const choice = data.choices && data.choices[0];
    const content = choice && (choice.message && choice.message.content ? choice.message.content : choice.text || '');
    const usage = data.usage || {};
    return {
      content,
      model: data.model || body.model,
      provider: p.name,
      tokensUsed: usage.total_tokens || null,
      raw: data,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw ApiError.internal('AI request timed out');
    }
    throw err;
  } finally {
    clear();
  }
}

async function generateImage({ prompt, size = '1024x1024', n = 1, model, provider } = {}) {
  const p = resolveProvider(provider);
  const url = `${p.apiBaseUrl.replace(/\/$/, '')}/images/generations`;
  const body = {
    prompt,
    n,
    size,
    model: model || p.imageModel,
  };
  const { signal, clear } = withTimeout();
  const start = Date.now();
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(p),
      body: JSON.stringify(body),
      signal,
    });
    if (resp.ok) {
      const data = await resp.json();
      const images = (data.data || []).map((d) => d.url || d.b64_json).filter(Boolean);
      if (images.length) {
        return { images, provider: p.name, model: body.model, durationMs: Date.now() - start, raw: data };
      }
    }
    // Fallback: produce a textual description via chat completion
    logger.warn('Image generation endpoint unavailable, falling back to chat', { provider: p.name, status: resp.status });
    const fallback = await chatCompletion({
      messages: [
        { role: 'system', content: 'You are an AI image prompt designer. Describe the image in detail.' },
        { role: 'user', content: `Describe an image for: ${prompt}` },
      ],
      model: p.defaultModel,
      provider: p.name,
    });
    return {
      images: [],
      description: fallback.content,
      provider: p.name,
      model: body.model,
      durationMs: Date.now() - start,
      fallback: true,
    };
  } catch (err) {
    if (err.name === 'AbortError') throw ApiError.internal('AI request timed out');
    throw err;
  } finally {
    clear();
  }
}

/**
 * Resolve provider settings from DB if configured, else fallback to env config.
 */
async function resolveProviderFromDb(providerName) {
  const name = providerName || ai.activeProvider;
  const dbRow = await models.AiProviderSetting.getDecrypted(name);
  if (dbRow && dbRow.is_active) {
    return {
      name,
      apiBaseUrl: dbRow.api_base_url,
      apiKey: dbRow.api_key,
      defaultModel: dbRow.default_model,
      imageModel: (dbRow.config && dbRow.config.imageModel) || ai.imageModel,
    };
  }
  return resolveProvider(name);
}

module.exports = {
  chatCompletion,
  generateImage,
  resolveProvider,
  resolveProviderFromDb,
  buildHeaders,
};
