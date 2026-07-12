# Al Rahid

A complete production-ready platform consisting of three independent projects:

```
alrahid/
├── backend/          # Node.js + Express + PostgreSQL REST API
├── admin-panel/      # React + Vite Admin Dashboard
├── android-app/      # Android Studio project (Kotlin + Retrofit)
├── DEPLOYMENT.md     # Full deployment guide
├── VPS_SETUP.md      # Ubuntu/Debian VPS setup
├── TERMUX_SETUP.md   # Termux (Android) setup
├── API_DOCUMENTATION.md  # Complete API reference
├── nginx.conf        # Production Nginx configuration
└── README.md         # This file
```

---

## What is Al Rahid?

Al Rahid is an AI-powered platform with:

- **Backend**: Standalone Node.js/Express REST API with PostgreSQL, JWT auth, 14 AI features, wallet system, file uploads, and full admin APIs. No Supabase, no Firebase, no browser-only backend.
- **Admin Panel**: React + Vite dashboard for managing users, AI providers, settings, analytics, prompts, banners, ads, media, and more.
- **Android App**: Kotlin app using Retrofit that connects to the backend via a single `API_BASE_URL` config. Includes all 14 AI features, wallet, notifications, profile, and settings.

---

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env    # edit values
npm install
npm run migrate
npm run seed
npm start
```
Server runs on `http://localhost:3000`.

### Admin Panel
```bash
cd admin-panel
cp .env.example .env    # set VITE_API_URL
npm install
npm run build           # production build to dist/
# or: npm run dev       # dev server at http://localhost:5173
```

### Android App
1. Open `android-app/` in Android Studio.
2. Set `API_BASE_URL` in `app/build.gradle.kts`.
3. Build > Build APK(s) for debug APK.
4. Build > Generate Signed Bundle/APK for release AAB.

See `android-app/README.md` for details.

---

## AI Features (14)

| Feature | Endpoint | Description |
|---------|----------|-------------|
| AI Chat | `POST /api/ai/chat` | Conversational AI |
| AI Image | `POST /api/ai/image` | Image generation |
| AI Video | `POST /api/ai/video` | Video storyboard/plan |
| AI Voice | `POST /api/ai/voice` | Voiceover script |
| AI Music | `POST /api/ai/music` | Music composition |
| AI Logo | `POST /api/ai/logo` | Logo generation |
| AI Resume | `POST /api/ai/resume` | Resume builder |
| AI Presentation | `POST /api/ai/presentation` | Slide deck builder |
| AI PDF | `POST /api/ai/pdf-summary` | Document summarizer |
| AI Code | `POST /api/ai/code` | Code generator |
| AI Website | `POST /api/ai/website` | Website builder |
| AI App | `POST /api/ai/app` | App blueprint |
| AI Email | `POST /api/ai/email` | Email writer |
| AI Document | `POST /api/ai/document` | Document writer |

### Supported AI Providers (configurable via .env)
- **OpenAI** (`AI_PROVIDER=openai`)
- **OpenRouter** (`AI_PROVIDER=openrouter`)
- **Groq** (`AI_PROVIDER=groq`)
- **Ollama** (`AI_PROVIDER=ollama`)

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@alrahid.com` | `Admin@123456` |
| Demo User | `demo@alrahid.com` | `Demo@123456` |

---

## Technology Stack

### Backend
Node.js LTS, Express, PostgreSQL, JWT (access + refresh), bcrypt, Helmet, CORS, rate limiting, Multer, express-validator, Winston, PM2, Docker, Docker Compose.

### Admin Panel
React 18, Vite 5, TailwindCSS, React Router 6, Recharts, Axios, lucide-react.

### Android
Kotlin, MVVM, Retrofit, OkHttp, Coroutines, Material 3, Jetpack Navigation, ViewBinding.

---

## Deployment

- **VPS (Ubuntu/Debian)**: See [VPS_SETUP.md](VPS_SETUP.md)
- **Docker**: `cd backend && docker compose up -d --build`
- **Termux (Android)**: See [TERMUX_SETUP.md](TERMUX_SETUP.md)
- **Full guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## No Payment Gateway

This project does NOT include any payment gateway. No Stripe, no Razorpay. The wallet system uses credits managed by admins. Ads configuration is prepared but not connected to any ad network.

---

## ZIP Archives

Three downloadable ZIP files are generated:

| File | Contents |
|------|----------|
| `alrahid-backend.zip` | Complete backend project |
| `alrahid-admin.zip` | Complete admin panel |
| `alrahid-android.zip` | Complete Android Studio project |

---

## License

MIT
