# Al Rahid — VPS Setup (Ubuntu / Debian / Linux VPS)

Complete guide for deploying the Al Rahid backend on a Linux VPS with Nginx, SSL, and PM2.

---

## 1. Server Requirements

- Ubuntu 22.04+ or Debian 12+ (any Linux VPS)
- 1 GB RAM minimum (2 GB recommended)
- 20 GB disk
- Root or sudo access
- A domain name pointing to your server's IP

## 2. Install System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx ufw

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt update
sudo apt install -y postgresql-16

# PM2
sudo npm install -g pm2

# Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## 3. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 4. Create Database

```bash
sudo -u postgres psql <<EOF
CREATE USER alrahid WITH PASSWORD 'choose_a_strong_password';
CREATE DATABASE al_rahid OWNER alrahid;
GRANT ALL PRIVILEGES ON DATABASE al_rahid TO alrahid;
EOF
```

## 5. Deploy Backend

```bash
sudo mkdir -p /opt/alrahid
sudo chown $USER:$USER /opt/alrahid
cd /opt/alrahid

# Copy your project (or clone from git)
cp -r /path/to/backend ./backend
cd backend

# Configure
cp .env.example .env
```

Edit `.env`:

```bash
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
APP_URL=https://api.yourdomain.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=al_rahid
DB_USER=alrahid
DB_PASSWORD=choose_a_strong_password

JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex')">
JWT_REFRESH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex')">

AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-key
AI_DEFAULT_MODEL=gpt-4o-mini

CORS_ORIGIN=https://admin.yourdomain.com,https://yourdomain.com
```

Install and migrate:

```bash
npm install --omit=dev
npm run migrate
npm run seed
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the printed instruction to enable PM2 on boot
```

## 6. Deploy Admin Panel

```bash
cd /opt/alrahid
cp -r /path/to/admin-panel ./admin-panel
cd admin-panel

echo "VITE_API_URL=https://api.yourdomain.com/api" > .env
npm install
npm run build
```

## 7. Configure Nginx

### Backend API (api.yourdomain.com)

Create `/etc/nginx/sites-available/alrahid-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Admin Panel (admin.yourdomain.com)

Create `/etc/nginx/sites-available/alrahid-admin`:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /opt/alrahid/admin-panel/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/alrahid-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/alrahid-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. SSL Certificates

```bash
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
```

Certbot automatically configures HTTPS and sets up auto-renewal.

## 9. Verify

```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok","app":"Al Rahid Backend",...}

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alrahid.com","password":"Admin@123456"}'
```

Open `https://admin.yourdomain.com` in your browser and log in.

## 10. Update Android App

In `android-app/app/build.gradle.kts`, set:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://api.yourdomain.com/api/\"")
```

Build the APK/AAB in Android Studio and distribute.

## 11. Ongoing Maintenance

```bash
# Update backend
cd /opt/alrahid/backend
git pull
npm install --omit=dev
npm run migrate
pm2 restart alrahid-backend

# Update admin panel
cd /opt/alrahid/admin-panel
git pull
npm install
npm run build

# View logs
pm2 logs alrahid-backend
tail -f /opt/alrahid/backend/logs/error.log

# SSL renewal (automatic, but test manually)
sudo certbot renew --dry-run
```

## 12. Backup Database

```bash
# Daily backup cron job
sudo crontab -e
# Add:
0 3 * * * pg_dump -U alrahid al_rahid | gzip > /opt/alrahid/backups/al_rahid_$(date +\%Y\%m\%d).sql.gz
```
