# Al Rahid Admin Panel

A production-ready React admin dashboard for the **Al Rahid** platform. Connects to the Al Rahid Node.js backend REST API.

## Tech Stack

- **React 18** + **Vite 5**
- **React Router 6** (client-side routing + protected routes)
- **TailwindCSS 3** (dark theme, teal/emerald primary)
- **Recharts** (analytics & dashboard charts)
- **lucide-react** (icons)
- **axios** (HTTP client with interceptors)
- **js-cookie** (token storage)

> JavaScript + JSX (no TypeScript).

## Features

- 🔐 JWT auth with token persistence (cookie + localStorage) + 401 auto-logout
- 📊 Dashboard with stat cards and charts (registrations, AI usage)
- 👥 User management — search, role badges, activate/deactivate, role change, delete
- 🤖 AI History — all generations across users, filter by type/status
- 🖼️ Uploads / Media manager — grid view, category filter, delete
- 🔔 Notifications — compose & broadcast to all users or a specific user
- ⚙️ Settings — app settings key/value editor + feature toggle switches
- 🔑 API Keys — audit view of all keys across users
- 📈 Activity Logs — filterable audit trail
- 📉 Analytics — daily registrations (line), AI usage (bar), wallet flow (area), active users (line)
- 🎨 Theme Settings — app branding (app_name, primary/secondary color, logo_url, theme) with live preview
- 🧠 Model Settings — AI provider CRUD (provider, api_base_url, api_key, default_model, is_active)
- 💬 Prompt Settings — prompt template CRUD (name, type, system_prompt, user_template, is_active)
- 🖼️ Banners — banner manager CRUD with position & date range
- 📣 Ads Config — ad placement CRUD (prepared for future ad delivery)

## Getting Started

### Prerequisites

- Node.js 18+
- The Al Rahid backend running (see `../backend`)

### Install & Run

```bash
# from the admin-panel directory
npm install
npm run dev      # start dev server on http://localhost:5174
```

### Build for Production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Configuration

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

| Variable        | Default                          | Description                  |
| --------------- | -------------------------------- | ---------------------------- |
| `VITE_API_URL`  | `http://localhost:3000/api`      | Backend REST API base URL    |

The Vite dev server also proxies `/api` → `http://localhost:3000` so you can run the panel and backend together without CORS configuration.

## Connecting to the Backend

1. Start the Al Rahid backend:

   ```bash
   cd ../backend
   npm install
   npm run dev    # serves on http://localhost:3000
   ```

2. Ensure a user with `admin` or `super_admin` role exists in the database.
   You can promote a user via SQL, e.g.:

   ```sql
   UPDATE users SET role = 'super_admin', is_active = TRUE WHERE email = 'you@example.com';
   ```

3. Start the admin panel (`npm run dev`) and log in with the admin credentials.
   The access token is stored in a cookie + localStorage and sent as `Authorization: Bearer <token>`.

### API Endpoints Used

All admin operations go through `/api/admin/*` (requires `admin`/`super_admin` role). The panel also reads:

- `POST /api/auth/login` — authentication
- `GET  /api/auth/me` — session validation
- `GET  /api/ai/history` — AI generations
- `GET  /api/notifications` — sent notifications list
- `GET  /api/notifications/unread/count` — top bar badge

## Project Structure

```
admin-panel/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx              # React root + providers
│   ├── App.jsx               # Routes + ProtectedRoute + Layout
│   ├── index.css             # Tailwind + dark theme styles
│   ├── api/
│   │   ├── client.js         # axios instance + interceptors
│   │   └── endpoints.js      # all API endpoint functions
│   ├── context/
│   │   └── AuthContext.jsx   # auth state + token management
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── Loading.jsx
│   │   ├── Toast.jsx
│   │   └── ConfirmDialog.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── utils/
│   │   └── format.js
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Users.jsx
│       ├── AiHistory.jsx
│       ├── Uploads.jsx
│       ├── Notifications.jsx
│       ├── Settings.jsx
│       ├── ApiKeys.jsx
│       ├── ActivityLogs.jsx
│       ├── Analytics.jsx
│       ├── ThemeSettings.jsx
│       ├── ModelSettings.jsx
│       ├── PromptSettings.jsx
│       ├── Banners.jsx
│       ├── AdsConfig.jsx
│       └── NotFound.jsx
└── README.md
```

## Design System

- **Background:** `bg-slate-900` (`#0f172a`)
- **Cards:** `bg-slate-800` (`#1e293b`), `rounded-xl`, subtle borders
- **Primary:** teal-500 `#14b8a6` / emerald-500 `#10b981`
- **Text:** `#e2e8f0`
- No purple/indigo colors — teal/emerald throughout.

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start Vite dev server          |
| `npm run build` | Production build to `dist/`    |
| `npm run preview` | Preview the production build |
