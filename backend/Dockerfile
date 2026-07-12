# ── Builder stage ─────────────────────────────────────────────
FROM node:20-book-slim AS builder

WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./

# Install all dependencies (no dev-only lockfile present; install normally)
RUN npm install --omit=dev --no-audit --no-fund

# ── Runtime stage ─────────────────────────────────────────────
FROM node:20-book-slim AS runtime

WORKDIR /app

# curl is needed for the HEALTHCHECK below
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure runtime directories exist
RUN mkdir -p uploads logs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fs http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
