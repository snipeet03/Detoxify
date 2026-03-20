# ⚡ Detoxify — Learn Without the Algorithm

A distraction-free YouTube learning platform with a full YouTube-style UI.
No infinite scroll. No autoplay. No algorithmic rabbit holes.
Just curated, ranked, high-signal video feeds on any topic you choose.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud) — optional but recommended
- YouTube Data API v3 key → https://console.developers.google.com/

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # fill in your values
npm run dev               # runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev               # runs on http://localhost:5173
```

Open http://localhost:5173 — you'll see the full YouTube-style UI.

---

## 🎨 UI Overview

| Area | Description |
|------|-------------|
| **Header** | YouTube-style top bar with inline search — type any topic and hit Enter |
| **Sidebar** | Compact left sidebar: Home, Feed, Creators, Bookmarks |
| **Filter Chips** | One-click topic chips (ML, DSA, React, Python, etc.) on the home page |
| **Video Grid** | Responsive 4-col grid with thumbnails, duration, channel avatar, views |
| **Shorts Row** | 5-col vertical card grid for short-form content |
| **Creators Panel** | Top channels for the topic with score badges |
| **Feed Page** | Full results page with sections: Today's Feed, Shorts, Creators, Saved |
| **Bookmarks** | Save videos with the bookmark icon — persisted in localStorage |

---

## 🔑 Environment Variables

### `backend/.env`

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/detoxify
REDIS_URL=redis://localhost:6379
YOUTUBE_API_KEY=your_youtube_api_key_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CACHE_TTL=21600
```

### `frontend/.env`

```
# Leave empty in dev — Vite proxy forwards /api to localhost:5000
VITE_API_URL=
```

---

## 📡 API Reference

### `POST /api/feed`
```json
{ "keyword": "machine learning", "type": "both", "level": "beginner" }
```
Returns: `{ data: { topVideos, shorts, creators }, meta: { totalFetched, cacheUsed } }`

### `POST /api/auth/register` / `POST /api/auth/login`
### `GET  /api/creators?category=AI`

---

## 🧠 Ranking Engine

```
score = (viewsNormalized  × 0.25)
      + (likesNormalized  × 0.25)
      + (recencyScore     × 0.20)   ← 30-day exponential decay
      + (channelAuthority × 0.20)   ← log-scaled subscriber count
      + (engagementRatio  × 0.10)   ← likes/views ratio
```

Pre-filtered for clickbait titles and spam (engagement < 1%).

---

## ⚡ Caching

- Redis key: `feed:{keyword}:{type}:{level}`
- TTL: 6 hours — repeated searches cost 0 API quota
- Daily cron at 3 AM UTC pre-warms 10 trending topics

---

## 🧪 Tests

```bash
cd backend && npm test
```

---

## 🚢 Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Connect GitHub repo to Vercel, set VITE_API_URL to your backend URL
```

**Backend → Render / Railway**
- Build: `npm install`
- Start: `npm start`
- Add all env vars from `.env.example`

---

## 📁 Structure

```
detoxify/
├── backend/
│   └── src/
│       ├── config/         DB + Redis
│       ├── controllers/    feedController, authController
│       ├── jobs/           daily cache pre-warm cron
│       ├── middlewares/    rate limiter, error handler
│       ├── models/         User, Creator (Mongoose)
│       ├── routes/         /api/feed, /api/auth, /api/creators
│       └── services/
│           ├── youtubeService.js   API calls + retry/backoff
│           ├── rankingEngine.js    composite scoring algorithm
│           ├── feedService.js      orchestrator
│           └── cacheService.js     Redis wrapper
└── frontend/
    └── src/
        ├── components/
        │   ├── Header.jsx       YouTube-style top bar + inline search
        │   ├── Sidebar.jsx      Mini left nav
        │   ├── VideoCard.jsx    Grid card + Short card variants
        │   └── SkeletonCard.jsx Loading placeholder
        ├── pages/
        │   ├── HomePage.jsx     Chips + topic grid + results
        │   ├── FeedPage.jsx     Full feed: videos + shorts + creators
        │   └── CreatorsPage.jsx Creator rankings with category filter
        ├── hooks/useFeed.js     Feed generation hook
        ├── services/api.js      Axios API layer
        └── store/useAppStore.js Zustand: feed, bookmarks, history
```
