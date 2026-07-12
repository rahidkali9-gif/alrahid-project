# Al Rahid — Termux Setup (Android)

Run the full Al Rahid backend directly on your Android phone using Termux.

---

## 1. Install Termux

Install [Termux](https://f-droid.org/packages/com.termux/) from F-Droid (the Play Store version is outdated).

## 2. Install Dependencies

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs git postgresql python which vim
```

## 3. Initialize PostgreSQL

```bash
# Initialize the database cluster
initdb $PREFIX/var/lib/postgresql

# Start PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/log/postgresql.log start

# Create database and user
createdb al_rahid
```

## 4. Clone and Configure

```bash
git clone <your-repo> ~/alrahid
cd ~/alrahid/backend
cp .env.example .env
```

Edit `.env` with Termux values:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=al_rahid
DB_USER=$(whoami)
DB_PASSWORD=
DB_SSL=false
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
```

## 5. Install and Run

```bash
npm install
npm run migrate
npm run seed
npm start
```

The backend runs at `http://localhost:3000`. To access from other devices on your network, find your phone's IP:

```bash
ifconfig wlan0 | grep "inet " | awk '{print $2}'
```

Then connect from another device to `http://<phone-ip>:3000`.

## 6. Keep Running with PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

To keep PM2 alive when Termux is closed:

```bash
pkg install -y termux-services
sv-enable pm2
```

Or use `termux-wake-lock` to prevent Android from killing the process:

```bash
termux-wake-lock
```

## 7. Expose to Internet (optional)

Use a tunnel like ngrok or cloudflared:

```bash
# Using ngrok
pkg install -y ngrok
ngrok http 3000
# You'll get a public HTTPS URL like https://abc123.ngrok.io

# Using cloudflared
pkg install -y cloudflared
cloudflared tunnel --url http://localhost:3000
```

Update your Android app's `API_BASE_URL` to the tunnel URL.

## 8. PostgreSQL Auto-Start

Add this to `~/.bashrc` to auto-start PostgreSQL:

```bash
if ! pg_isready -q 2>/dev/null; then
  pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/log/postgresql.log start 2>/dev/null
fi
```

---

## Notes

- Termux runs as a regular user — no `sudo` needed.
- PostgreSQL in Termux runs on the default port 5432.
- File uploads are stored in `uploads/` within the project directory.
- Logs are written to `logs/`.
- For production use, a dedicated VPS is recommended over Termux.
