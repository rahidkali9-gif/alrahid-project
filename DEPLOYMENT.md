# Al Rahid — Deployment Guide

This document covers deploying the Al Rahid backend, admin panel, and Android app.

---

## Architecture Overview

```
┌─────────────────┐     REST API      ┌──────────────────┐     ┌──────────────┐
│  Android APK    │ ──────────────── │  Node.js Backend  │ ──▶ │  PostgreSQL   │
│  (API_BASE_URL) │  HTTPS / JSON    │  (Express + JWT)  │     │  Database     │
└─────────────────┘                  └──────┬───────────┘     └──────────────┘
                                            │
┌─────────────────┐     REST API           │
│  Admin Panel    │ ──────────────────────┘
│  (Vite + React) │
└─────────────────┘
```

---

## 1. Backend Deployment

### Option A: Docker Compose (recommended)

```bash
cd backend
cp .env.example .env
# Edit .env: set JWT_SECRET, JWT_REFRESH_SECRET, DB_PASSWORD, AI_API_KEY
docker compose up -d --build
# Run migrations + seed
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

The backend will be available at `http://localhost:3000`. PostgreSQL runs in a companion container with a persistent volume.

### Option B: Linux VPS / Ubuntu / Debian with PM2

```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib

# 2. Create database
sudo -u postgres psql -c "CREATE USER alrahid WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE al_rahid OWNER alrahid;"

# 3. Deploy backend
git clone <your-repo> /opt/alrahid
cd /opt/alrahid/backend
cp .env.example .env
# Edit .env with DB credentials, JWT secrets, AI API key
npm install --omit=dev
npm run migrate
npm run seed

# 4. Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # follow printed instructions

# 5. Install Nginx reverse proxy + SSL
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp /path/to/nginx.conf /etc/nginx/sites-available/alrahid
sudo ln -s /etc/nginx/sites-available/alrahid /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

### Option C: Termux (Android)

See [TERMUX_SETUP.md](TERMUX_SETUP.md) for detailed Termux instructions.

---

## 2. Admin Panel Deployment

The admin panel is a static SPA built with Vite. Build it and serve via any static file server or Nginx.

```bash
cd admin-panel
cp .env.example .env
# Set VITE_API_URL to your backend's public URL, e.g.:
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env
npm install
npm run build
# Output is in dist/ — serve it with Nginx
```

### Nginx config for admin panel

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /opt/alrahid/admin-panel/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

Get SSL: `sudo certbot --nginx -d admin.yourdomain.com`

---

## 3. Android App

1. Open `android-app/` in Android Studio.
2. Edit `app/build.gradle.kts` — change `API_BASE_URL` to your backend URL:
   ```kotlin
   buildConfigField("String", "API_BASE_URL", "\"https://api.yourdomain.com/api/\"")
   ```
3. Build > Build Bundle(s)/APK(s) > Build APK(s) for a debug APK.
4. Build > Generate Signed Bundle/APK for a release AAB (Play Store).
5. Upload the `.aab` to the Google Play Console.

See [android-app/README.md](android-app/README.md) for full instructions.

---

## 4. Environment Variables Checklist

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Access token signing secret (64+ hex chars) | `a1b2c3...` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | `d4e5f6...` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PASSWORD` | PostgreSQL password | `strong_password` |
| `AI_PROVIDER` | AI provider selection | `openai` |
| `AI_API_KEY` | AI provider API key | `sk-...` |
| `AI_DEFAULT_MODEL` | Default AI model | `gpt-4o-mini` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://admin.yourdomain.com` |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Post-Deployment Verification

```bash
# Health check
curl https://api.yourdomain.com/health

# Auth test
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alrahid.com","password":"Admin@123456"}'

# Admin stats (with token from login)
curl https://api.yourdomain.com/api/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## 6. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@alrahid.com` | `Admin@123456` |
| Demo User | `demo@alrahid.com` | `Demo@123456` |

Change these immediately after first login in production.
