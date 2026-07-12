# Al Rahid — API Documentation

Base URL: `http://localhost:3000` (or your production domain)

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

All responses use this envelope:
```json
{ "success": true, "message": "OK", "data": { ... } }
```

Error responses:
```json
{ "success": false, "message": "Error description", "code": "ERROR_CODE" }
```

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new account |
| POST | `/api/auth/login` | No | Login, returns access + refresh token |
| POST | `/api/auth/logout` | Yes | Logout, clears refresh token |
| POST | `/api/auth/refresh` | Refresh | Refresh access token |
| POST | `/api/auth/forgot-password` | No | Request password reset link |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/auth/me` | Yes | Get current user session |

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "user" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

## User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | Yes | Get profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| PATCH | `/api/users/profile` | Yes | Update profile (partial) |
| PUT | `/api/users/basic` | Yes | Update basic info (name, avatar, phone, bio) |
| GET | `/api/users/overview` | Yes | Dashboard overview (wallet, notifications, stats) |

---

## Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings` | Yes | List user settings |
| POST | `/api/settings` | Yes | Upsert setting |
| DELETE | `/api/settings` | Yes | Delete setting |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | List notifications |
| PATCH | `/api/notifications/{id}/read` | Yes | Mark as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/api/notifications/{id}` | Yes | Delete notification |

---

## History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/history` | Yes | List history |
| DELETE | `/api/history/{id}` | Yes | Delete entry |
| DELETE | `/api/history` | Yes | Clear all history |

---

## Wallet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet` | Yes | Get wallet info |
| GET | `/api/wallet/balance` | Yes | Get balance |
| GET | `/api/wallet/transactions` | Yes | List transactions |

---

## Activity Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/activity` | Yes | List activity logs |

---

## API Keys

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/api-keys` | Yes | List API keys |
| POST | `/api/api-keys` | Yes | Create API key (raw key shown once) |
| PATCH | `/api/api-keys/{id}/revoke` | Yes | Revoke key |
| DELETE | `/api/api-keys/{id}` | Yes | Delete key |

---

## AI Features (14)

All AI endpoints require auth and consume wallet credits.

| Method | Endpoint | Credits | Description |
|--------|----------|---------|-------------|
| POST | `/api/ai/chat` | 1 | AI Chat (messages array or prompt) |
| POST | `/api/ai/image` | 5 | AI Image Generator |
| POST | `/api/ai/video` | 20 | AI Video Generator (storyboard) |
| POST | `/api/ai/voice` | 8 | AI Voice Script Generator |
| POST | `/api/ai/music` | 10 | AI Music Composition |
| POST | `/api/ai/logo` | 5 | AI Logo Generator |
| POST | `/api/ai/resume` | 3 | AI Resume Builder |
| POST | `/api/ai/presentation` | 4 | AI Presentation Builder |
| POST | `/api/ai/pdf-summary` | 3 | AI PDF/Document Summarizer |
| POST | `/api/ai/code` | 2 | AI Code Generator |
| POST | `/api/ai/website` | 6 | AI Website Builder |
| POST | `/api/ai/app` | 8 | AI App Builder |
| POST | `/api/ai/email` | 2 | AI Email Writer |
| POST | `/api/ai/document` | 3 | AI Document Writer |
| GET | `/api/ai/` | — | AI info (types, costs) |
| GET | `/api/ai/history` | — | List AI generations |

### AI Chat Example
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Write a haiku about coding." }
  ]
}
```

Or simplified:
```json
{ "prompt": "Write a haiku about coding." }
```

### AI Image Example
```http
POST /api/ai/image
Authorization: Bearer <token>
Content-Type: application/json

{ "prompt": "A futuristic city at sunset", "size": "1024x1024" }
```

### AI Code Example
```http
POST /api/ai/code
Authorization: Bearer <token>
Content-Type: application/json

{ "prompt": "Binary search in Python", "language": "python" }
```

### AI PDF Summary Example
```http
POST /api/ai/pdf-summary
Authorization: Bearer <token>
Content-Type: application/json

{ "text": "<paste document text here>", "prompt": "Summarize key points" }
```

---

## Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/uploads` | Yes | Upload single file (`file` field, multipart) |
| POST | `/api/uploads/multiple` | Yes | Upload multiple files (`files` field) |
| GET | `/api/uploads` | Yes | List uploads |
| DELETE | `/api/uploads/{id}` | Yes | Delete upload |

### Upload Example
```http
POST /api/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary file>
```

---

## System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Simple health check |
| GET | `/api/system/health` | No | Detailed health (DB, AI provider) |
| GET | `/api/system/stats` | Admin | System statistics |

---

## Admin Endpoints

All admin endpoints require `authenticate` + `authorize('admin', 'super_admin')`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user detail |
| PATCH | `/api/admin/users/:id/role` | Update user role (super_admin) |
| PATCH | `/api/admin/users/:id/activate` | Toggle user active |
| DELETE | `/api/admin/users/:id` | Delete user (super_admin) |
| POST | `/api/admin/wallet/adjust` | Grant/deduct credits |
| GET | `/api/admin/ai-providers` | List AI provider settings |
| POST | `/api/admin/ai-providers` | Update AI provider settings |
| DELETE | `/api/admin/ai-providers/:provider` | Remove provider config |
| GET | `/api/admin/app-settings` | List app settings |
| POST | `/api/admin/app-settings` | Upsert app setting |
| DELETE | `/api/admin/app-settings/:key` | Delete app setting |
| GET | `/api/admin/feature-toggles` | List feature toggles |
| POST | `/api/admin/feature-toggles` | Update feature toggle |
| DELETE | `/api/admin/feature-toggles/:key` | Delete feature toggle |
| POST | `/api/admin/notifications/broadcast` | Send notification to users |
| GET | `/api/admin/api-keys` | List all API keys |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/logs` | Activity logs (all users) |
| GET | `/api/admin/system` | System info |
| GET | `/api/admin/media` | List all uploads |
| DELETE | `/api/admin/media/:id` | Delete upload |
| GET | `/api/admin/prompts` | List prompts |
| POST | `/api/admin/prompts` | Create/update prompt |
| PATCH | `/api/admin/prompts/:id` | Update prompt |
| DELETE | `/api/admin/prompts/:id` | Delete prompt |
| GET | `/api/admin/banners` | List banners |
| POST | `/api/admin/banners` | Create/update banner |
| PATCH | `/api/admin/banners/:id` | Update banner |
| DELETE | `/api/admin/banners/:id` | Delete banner |

---

## AI Providers

The backend supports 4 providers, selectable via `AI_PROVIDER` env var:

| Provider | Env Value | Base URL |
|----------|-----------|----------|
| OpenAI | `openai` | `https://api.openai.com/v1` |
| OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` |
| Groq | `groq` | `https://api.groq.com/openai/v1` |
| Ollama (local) | `ollama` | `http://localhost:11434/v1` |

All use the OpenAI-compatible `/chat/completions` endpoint. Image generation uses `/images/generations` (OpenAI only; other providers fall back to a text description).

Provider can also be changed at runtime from the Admin Panel via the AI Provider Settings CRUD.

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@alrahid.com` | `Admin@123456` |
| Demo User | `demo@alrahid.com` | `Demo@123456` |

---

## Rate Limits

| Scope | Window | Max Requests |
|-------|--------|-------------|
| General (/api) | 15 min | 300 |
| Auth (/api/auth) | 1 min | 10 |
| AI (/api/ai) | 1 min | 30 |
| Uploads (/api/uploads) | 10 min | 50 |

Rate-limited responses return `429` with `RATE_LIMIT_EXCEEDED` code.
