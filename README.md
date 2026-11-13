# Movie Night

Self-hosted PWA for matching movies with friends. Create a session, invite people by username or invite code, add movies from TMDB, swipe like/skip, and see matches when everyone likes the same title. Ranked view sorts by like count.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Postgres 16 (Docker)
- Drizzle ORM
- Auth.js credentials (username + password)
- TMDB API
- Serwist PWA

## Quick start (Docker)

1. Copy env and fill in secrets:

```bash
cp .env.example .env
# set AUTH_SECRET (openssl rand -base64 32)
# set NEXT_PUBLIC_TMDB_API_KEY from https://www.themoviedb.org/settings/api
```

2. Start everything:

```bash
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000)

Compose starts Postgres, runs migrations, then the app.

## Local development

```bash
cp .env.example .env
# edit DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_TMDB_API_KEY

docker compose up db -d
npm install
npm run db:migrate
npm run dev
```

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |

## PWA install

- **iPhone:** Safari → Share → Add to Home Screen  
- **Android:** Chrome menu → Install app / Add to Home Screen  

HTTPS (or localhost) is required for a reliable install experience.

## Product rules

- Session owner can add members by username; anyone can join with the invite code
- Any member can add movies
- Like/skip once per movie; skips leave the feed for that user
- Match when every current member has liked the movie
- “Liked” tab ranks movies by like count
