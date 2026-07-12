# Al Rahid Backend

A complete, standalone, production-ready **Node.js / Express / PostgreSQL** backend with JWT auth, RBAC, AI features (14 types), a credit wallet, file uploads, and a full admin panel — **no Supabase, no Firebase, no Bolt backend, no browser-only backend**. Fully independent.

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Runtime | Node.js LTS (>=18, tested on 20/22) |
| Framework | Express 4 |
| Database | PostgreSQL (via `pg`) |
| Auth | JWT access (15m) + refresh (7d), bcrypt |
| Security | Helmet, CORS, express-rate-limit |
| Validation | express-validator |
| Uploads | Multer |
| Logging | Winston (file + console) |
| Compression | compression |
| HTTP logs | morgan |
| Archiving | archiver |
| AI | OpenAI-compatible `fetch` calls (OpenAI, OpenRouter, Groq, Ollama) |
| Module system | CommonJS (`require`/`module.exports`) |

---

## Features

### Authentication & RBAC
- Register, login, logout, refresh, forgot-password, reset-password, change-password
- JWT access (15m) + refresh (7d, httpOnly cookie)
- Roles: `user`, `admin`, `super_admin`
- Rate-limited auth routes

### User
- Profile get/update + extended profile (1:1)
- Per-user settings (key/value CRUD, bulk)
- Notifications (list, unread count, mark read, mark all read, delete)
- History (list, delete, clear all)
- Wallet (balance + transaction ledger)
- Activity logs (list)
- API keys (create — raw key shown once, list, revoke, delete — SHA-256 hashed)

### AI (14 features)
`chat`, `image`, `video`, `voice`, `music`, `logo`, `resume`, `presentation`, `pdf_summary`, `code`, `website`, `app`, `email`, `document`

- Each charges wallet credits, records the generation, and refunds on failure
- Providers: **OpenAI, OpenRouter, Groq, Ollama** — selectable via `AI_PROVIDER`
- All use OpenAI-compatible `/chat/completions` via `fetch`
- Image uses `/images/generations` with chat fallback
- 120s `AbortController` timeout

### Uploads
- image / video / audio / pdf / document via Multer with MIME validation
- Category subdirs, served via Express static

### Admin Panel
- Dashboard stats (users, AI generations, total credits, active users)
- User management (list, get, role change [super_admin], activate/deactivate, delete [super_admin])
- AI provider settings CRUD (encrypted API keys)
- App settings CRUD (global config)
- Feature toggles CRUD
- Notifications broadcast (all users or specific user)
- API keys management (all users)
- Analytics (registrations, AI usage by type, wallet flow)
- Logs viewer (filter by user/category)
- System settings (server info, DB status, AI provider status)
- Media manager (list, delete)
- Prompt manager CRUD
- Banner manager CRUD
- Ads manager CRUD (prepared for future)
- Admin action audit log
- Wallet grant/deduct

---

## Folder Structure

```
backend/
  server.js, app.js, package.json, .env.example, .gitignore, .dockerignore,
  Dockerfile, docker-compose.yml, ecosystem.config.js, README.md
  config/        index.js, env.js, db.js, security.js, rateLimit.js, ai.js
  database/      index.js, README.md, seeders/, migrations/
  models/        User, Profile, Setting, Notification, Wallet, ActivityLog,
                 ApiKey, AiGeneration, History, Upload, PasswordChange,
                 AppSetting, FeatureToggle, AiProviderSetting, AdminAction, index.js
  controllers/   auth, user, settings, notification, history, wallet, activity,
                 apiKey, ai, upload, system, admin
  routes/        index + per-feature route files
  middleware/    auth, roles, validate, error, upload, rateLimit, activityLog
  services/      authService, aiProvider, aiService, emailService, uploadService, adminService
  utils/         logger, ApiError, ApiResponse, asyncHandler, jwt, crypto, files, validators
  scripts/       migrate.js, seed.js, zip.js
  uploads/       (.gitkeep)
  logs/          (.gitkeep)
  public/        index.html
```

---

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 13

### 1. Install dependencies
```bash
npm install --no-audit --no-fund
```

### 2. Configure environment
```bash
cp .env.example .env
# edit .env with your DB + JWT + AI credentials
```

### 3. Set up the database
```bash
# Create the database (once)
createdb alrahid   # or via psql: CREATE DATABASE alrahid;

# Run migrations
npm run migrate

# Seed default data
npm run seed
```

### 4. Start the server
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:3000` by default.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the server (dev) |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run migrate:undo` | Revert the last migration (requires `.down.sql`) |
| `npm run seed` | Insert idempotent seed data |
| `npm run db:reset` | Migrate + seed |
| `npm run zip` | Create `alrahid-backend.zip` (excludes node_modules, .env, logs, etc.) |

---

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| super_admin | `admin@alrahid.com` | `Admin@123456` |
| user | `demo@alrahid.com` | `Demo@123456` |

- Admin wallet: 100000 credits
- Demo wallet: 10000 credits

---

## API Reference

All routes are under `/api` unless noted. Auth uses `Authorization: Bearer <accessToken>`.

### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/api` | — | API index |
| GET | `/api/info` | — | Public app info, settings, features |
| GET | `/api/features` | — | Feature toggles (public) |
| GET | `/api/system/health` | — | System health |
| GET | `/api/system/info` | — | System info |
| GET | `/api/system/features` | — | Feature toggles |

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | yes | Logout |
| POST | `/api/auth/refresh` | — | Refresh tokens |
| POST | `/api/auth/forgot-password` | — | Request reset link |
| POST | `/api/auth/reset-password` | — | Reset password with token |
| POST | `/api/auth/change-password` | yes | Change password |
| GET | `/api/auth/me` | yes | Current user |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | yes | Get profile |
| PUT | `/api/users/profile` | yes | Update extended profile |
| PUT | `/api/users/basic` | yes | Update name/avatar |
| GET | `/api/users/overview` | yes | User overview |

### Settings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings` | yes | List user settings |
| GET | `/api/settings/:key` | yes | Get one setting |
| POST | `/api/settings` | yes | Upsert setting |
| PUT | `/api/settings` | yes | Bulk upsert |
| DELETE | `/api/settings/:key` | yes | Delete setting |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | yes | List (supports `unread=true`) |
| GET | `/api/notifications/unread/count` | yes | Unread count |
| PATCH | `/api/notifications/:id/read` | yes | Mark read |
| PATCH | `/api/notifications/read-all` | yes | Mark all read |
| DELETE | `/api/notifications/:id` | yes | Delete |

### History
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/history` | yes | List history |
| DELETE | `/api/history/all` | yes | Clear all |
| DELETE | `/api/history/:id` | yes | Delete one |

### Wallet
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet` | yes | Balance |
| GET | `/api/wallet/balance` | yes | Balance |
| GET | `/api/wallet/transactions` | yes | Transaction ledger |

### Activity
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/activity` | yes | Activity logs |

### API Keys
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/api-keys` | yes | Create (raw key shown once) |
| GET | `/api/api-keys` | yes | List |
| PATCH | `/api/api-keys/:id/revoke` | yes | Revoke |
| DELETE | `/api/api-keys/:id` | yes | Delete |

### AI (14 features)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai` | yes | Types + costs |
| GET | `/api/ai/history` | yes | Generation history |
| POST | `/api/ai/chat` | yes | Chat |
| POST | `/api/ai/image` | yes | Image |
| POST | `/api/ai/video` | yes | Video |
| POST | `/api/ai/voice` | yes | Voice |
| POST | `/api/ai/music` | yes | Music |
| POST | `/api/ai/logo` | yes | Logo |
| POST | `/api/ai/resume` | yes | Resume |
| POST | `/api/ai/presentation` | yes | Presentation |
| POST | `/api/ai/pdf-summary` | yes | PDF summary |
| POST | `/api/ai/code` | yes | Code |
| POST | `/api/ai/website` | yes | Website |
| POST | `/api/ai/app` | yes | App |
| POST | `/api/ai/email` | yes | Email |
| POST | `/api/ai/document` | yes | Document |

### Uploads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/uploads` | yes | Upload file (`multipart/form-data`, field `file`) |
| GET | `/api/uploads` | yes | List uploads |
| DELETE | `/api/uploads/:id` | yes | Delete upload |

### Admin (requires `admin` or `super_admin`; some `super_admin` only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Get user |
| PATCH | `/api/admin/users/:id/role` | Update role (super_admin) |
| PATCH | `/api/admin/users/:id/activate` | Activate/deactivate |
| DELETE | `/api/admin/users/:id` | Delete (super_admin) |
| POST | `/api/admin/wallet/adjust` | Grant/deduct credits |
| GET | `/api/admin/ai-providers` | List AI providers |
| POST | `/api/admin/ai-providers` | Upsert provider |
| DELETE | `/api/admin/ai-providers/:provider` | Delete (super_admin) |
| GET | `/api/admin/app-settings` | List app settings |
| POST | `/api/admin/app-settings` | Upsert app setting |
| DELETE | `/api/admin/app-settings/:key` | Delete (super_admin) |
| GET | `/api/admin/feature-toggles` | List toggles |
| POST | `/api/admin/feature-toggles` | Upsert toggle |
| DELETE | `/api/admin/feature-toggles/:key` | Delete (super_admin) |
| POST | `/api/admin/notifications/broadcast` | Broadcast notification |
| GET | `/api/admin/api-keys` | All API keys |
| GET | `/api/admin/analytics` | Analytics |
| GET | `/api/admin/logs` | Activity logs (filter) |
| GET | `/api/admin/system` | System info |
| GET | `/api/admin/media` | List media |
| DELETE | `/api/admin/media/:id` | Delete media |
| GET | `/api/admin/prompts` | List prompts |
| POST | `/api/admin/prompts` | Create prompt |
| PATCH | `/api/admin/prompts/:id` | Update prompt |
| DELETE | `/api/admin/prompts/:id` | Delete prompt |
| GET | `/api/admin/banners` | List banners |
| POST | `/api/admin/banners` | Create banner |
| PATCH | `/api/admin/banners/:id` | Update banner |
| DELETE | `/api/admin/banners/:id` | Delete banner |
| GET | `/api/admin/ads` | List ads |
| POST | `/api/admin/ads` | Create ad |
| PATCH | `/api/admin/ads/:id` | Update ad |
| DELETE | `/api/admin/ads/:id` | Delete ad |
| GET | `/api/admin/audit` | Admin action audit log |

---

## Deployment

### Ubuntu / Debian / VPS

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PostgreSQL
sudo apt-get install -y postgresql
sudo -u postgres createuser -P alrahid
sudo -u postgres createdb -O alrahid alrahid

# 3. Clone & install
git clone <repo> alrahid-backend && cd alrahid-backend
npm install --no-audit --no-fund

# 4. Configure
cp .env.example .env && nano .env

# 5. Migrate & seed
npm run migrate && npm run seed

# 6. Start
npm start
```

### Termux (Android)

```bash
pkg update && pkg install nodejs postgresql -y
initdb -D ~/pgdata
pg_ctl -D ~/pgdata -l ~/pg.log start
createdb alrahid
cd alrahid-backend
npm install --no-audit --no-fund
cp .env.example .env  # edit DB_HOST, credentials
npm run migrate && npm run seed
npm start
```

### PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker / Docker Compose

```bash
cp .env.example .env  # fill in secrets
docker compose up -d --build
# run migrations inside the container:
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

---

## Security Notes

- **Never commit `.env`.** It is gitignored.
- Use long, random `JWT_SECRET` and `JWT_REFRESH_SECRET` in production.
- Set `CORS_ORIGIN` to your exact frontend origin(s) in production (not `*`).
- Set `DB_SSL=true` when connecting to a remote managed Postgres.
- API keys are stored as **SHA-256 hashes**; the raw key is shown only once at creation.
- AI provider API keys in the DB are **AES-256-CBC encrypted** at rest.
- Refresh tokens are stored server-side and rotated on refresh.
- Rate limiting is applied to `/api` (general) and to auth routes (stricter).
- Helmet security headers are enabled.
- Graceful shutdown drains the HTTP server and closes the DB pool on `SIGINT`/`SIGTERM`.

---

## License

MIT © Al Rahid
