# Flashcards - Agent Context

## Project Overview

Spaced repetition flashcard app with Anki SM-2 algorithm. Originally a Next.js app, now migrated to a Vite SPA + Hono backend architecture deployed on Vercel with Neon PostgreSQL.

## Architecture

```
flashcards/
├── apps/
│   ├── web/              # Vite + React + TanStack Router/Query + Tailwind CSS v4
│   └── server/           # Bun + Hono + Drizzle ORM + Neon PostgreSQL
├── packages/
│   └── shared/           # Zod schemas shared between frontend and backend
├── api/
│   └── index.js          # Vercel Serverless Function entrypoint (CJS adapter)
├── vercel.json           # Vercel deployment config
├── deploy.sh             # One-command deploy script
└── package.json          # Root Bun workspace config
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 6, React 19, TypeScript, TanStack Router (code-based), TanStack Query, Tailwind CSS v4 |
| Backend | Hono 4, Drizzle ORM, Neon PostgreSQL (`@neondatabase/serverless`) |
| Runtime | Bun locally, Node.js 18 on Vercel Serverless Functions |
| Deploy | Vercel (frontend static + backend serverless) |
| Database | Neon PostgreSQL (serverless, free tier) |

## Local Development

```bash
# Install dependencies
bun install

# Set up database
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env and add DATABASE_URL from Neon

cd apps/server
bun run db:push  # Push schema to Neon

# Terminal 1: Backend
bun run --filter server dev   # http://localhost:3001

# Terminal 2: Frontend
bun run --filter web dev      # http://localhost:5173
```

The frontend proxies `/api/*` to `localhost:3001` via Vite config.

## Deploy to Vercel

```bash
# Login (one time)
vercel login

# Deploy everything (frontend + backend)
./deploy.sh
```

The deploy script:
1. Installs dependencies
2. Builds the server bundle to `apps/server/dist/app.cjs` (CJS for Vercel)
3. Builds the frontend to `apps/web/dist`
4. Deploys to Vercel

**IMPORTANT:** After first deploy, go to Vercel dashboard → Project Settings → Environment Variables and add:
- `DATABASE_URL` (Neon connection string)
- `AI_GATEWAY_API_KEY` (optional, for AI card generation)

Then redeploy: `vercel --prod --yes`

## Key Design Decisions

### 1. Vercel Serverless Functions (not Edge)
We use Node.js 18.x runtime (`api/index.js` as CJS) because:
- `@neondatabase/serverless` works in Node.js but not Edge
- Hono's `app.fetch()` expects Fetch API `Request`, but Vercel Serverless gives Node.js `IncomingMessage`
- The `api/index.js` adapter manually converts Node.js `(req, res)` → Fetch API `Request`

### 2. Lazy Database Connection
`apps/server/src/db/index.ts` uses a Proxy to defer `neon()` initialization until first query. This prevents "No DATABASE_URL" errors during build/bundle time.

### 3. CJS Bundle for Vercel
Bun builds to `dist/app.cjs` with `--target node --format cjs`. The `package.json` `"type": "module"` is temporarily removed during build to allow CJS output.

### 4. Code-Based Routing (not File-Based)
TanStack Router uses code-based routing in `apps/web/src/routes.tsx` instead of the file-based generator. This avoids issues with `.js` file conflicts during build.

### 5. Shared Zod Schemas
`packages/shared/src/index.ts` contains all Zod schemas. Both frontend and backend import from here to keep types in sync.

## Database Schema (PostgreSQL)

Tables: `decks`, `groups`, `cards`, `tags`, `card_tags`

Cards have SM-2 fields:
- `state`: 'new' | 'learning' | 'review' | 'relearning'
- `interval`, `ease_factor`, `repetitions`
- `next_review`, `last_reviewed`, `last_rating`
- `learning_step`, `due_minutes`

## API Endpoints

All prefixed with `/api`:

- `GET/POST /decks` — List / Create decks
- `GET/PUT/DELETE /decks/:id` — Deck detail
- `GET/POST /decks/:id/groups` — Groups
- `PUT/DELETE /decks/:id/groups/:groupId`
- `GET/POST /decks/:id/cards` — Cards
- `POST /decks/:id/cards/batch` — Batch create
- `PUT/DELETE /decks/:id/cards/:cardId`
- `GET/POST /decks/:id/tags`
- `DELETE /decks/:id/tags/:tagId`
- `GET/POST /decks/:id/cards/:cardId/tags`
- `GET/POST /study/:deckId` — Anki SM-2 study system
- `POST /correct` — Grammar correction via AI
- `POST /decks/:id/extract-text` — OCR from images
- `POST /decks/:id/generate-from-text` — AI flashcard generation

## Visual Design

- **Concept**: "Cozy brain" — warm, human, nothing clinical
- **Palette**: Cream (`#FDF8F3`), coral (`#E8704A`), amber (`#D4A017`), charcoal (`#2D2A26`)
- **Typography**: Playfair Display (display), Newsreader (body)
- **Animations**: 3D card flip, fade-in-up stagger, hover scale on rating buttons
- **Study screen**: Immersive, large centered card, 4 color-coded rating buttons

## Current Status

✅ Full stack migrated from Next.js to Vite + Hono  
✅ Frontend builds and deploys to Vercel  
✅ Backend deploys as Vercel Serverless Function  
✅ Neon PostgreSQL schema pushed  
✅ Anki SM-2 algorithm implemented  
✅ All CRUD operations working  
✅ SPA routing with TanStack Router  
✅ CORS configured for production

## Environment Variables

Required for production:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (optional, for generate-from-text)

## Known Issues / Notes

1. **Vercel cold starts**: First API request after deploy may take 1-3s due to serverless cold start. Subsequent requests are fast.
2. **Bun vs Node**: Local dev uses Bun. Vercel uses Node.js. The CJS bundle bridges this gap.
3. **File extensions in imports**: The backend uses `.ts` imports (bundler resolution). Do NOT add `.js` extensions to backend imports — Bun handles this.
4. **Frontend API calls**: Always use relative paths: `fetch("/api/decks")`. Vite proxy handles local dev, Vercel rewrites handle production.
5. **Workspace dependency**: `@flashcards/shared` is a workspace dependency. Make sure `bun install` runs from root so workspaces resolve.

## Next Steps / Ideas

- [ ] Dark mode toggle
- [ ] PWA support (service worker, offline)
- [ ] Import/export decks (JSON/CSV/Anki .apkg)
- [ ] Image upload for cards
- [ ] Statistics dashboard (study streak, cards learned, etc.)
- [ ] Audio recording for pronunciation cards
- [ ] Shared decks / community features

## Commands Reference

```bash
# Local dev
bun run --filter server dev    # Backend
bun run --filter web dev       # Frontend

# Database
cd apps/server && bun run db:push      # Push schema changes
cd apps/server && bun run db:generate  # Generate migration
cd apps/server && bun run db:migrate  # Apply migration

# Build
bun run --filter server build  # Server bundle (Bun)
bun run --filter web build     # Frontend (Vite)

# Deploy
./deploy.sh                     # Deploy everything
vercel --prod --yes            # Quick production deploy
```

## Important Files

- `apps/web/src/routes.tsx` — All frontend routes
- `apps/web/src/lib/api.ts` — Frontend API client
- `apps/server/src/app.ts` — Hono app with all routes
- `apps/server/src/routes/*.ts` — Individual API route handlers
- `apps/server/src/lib/anki-sm2.ts` — SM-2 algorithm implementation
- `api/index.js` — Vercel entrypoint (Node.js adapter)
- `vercel.json` — Deploy config
- `packages/shared/src/index.ts` — Shared Zod schemas

## For the Next Agent

1. Read `apps/server/src/app.ts` and `apps/web/src/routes.tsx` to understand the full app structure.
2. Backend routes use Hono's `.route()` pattern. Each route file exports a `Hono` instance.
3. The database connection is lazy — don't worry about `DATABASE_URL` being missing at import time.
4. Frontend uses TanStack Query with `staleTime: 5min` and `refetchOnWindowFocus: false`.
5. The `deploy.sh` script handles everything. If you change backend code, re-run it.
6. This is a Bun workspace. Always run `bun install` from root, never in individual app folders.
