# Flashcards

A spaced repetition flashcard app with a beautiful study experience. Built with Vite, React, TanStack Router, Hono, Drizzle ORM, and Neon PostgreSQL.

## Quick Start

```bash
# Install dependencies
bun install

# Set up database (copy your Neon connection string)
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env and add DATABASE_URL

# Push schema to database
cd apps/server && bun run db:push && cd ../..

# Run locally
bun run --filter server dev   # Terminal 1: Backend
bun run --filter web dev      # Terminal 2: Frontend
```

Open `http://localhost:5173`

---

## Deploy to Vercel (One Command)

Everything runs on Vercel: the SPA frontend and the API backend under the same domain.

### Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed:
   ```bash
   npm i -g vercel
   ```

### One-time setup

```bash
# Login to Vercel (only once)
vercel login
```

### Deploy

```bash
# Run the deploy script
./deploy.sh
```

This script will:
1. Check that you're logged in to Vercel
2. Build the frontend (`apps/web`)
3. Deploy to Vercel with the correct settings
4. Guide you to add environment variables

### Add environment variables

After the first deploy, go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project → **Settings** → **Environment Variables**, and add:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your Neon connection string | ✅ Yes |
| `AI_GATEWAY_API_KEY` | Your AI Gateway key | ❌ Optional (for AI card generation) |

Then redeploy:
```bash
vercel --yes
```

### How it works

```
https://your-app.vercel.app/           → SPA (React + TanStack Router)
https://your-app.vercel.app/api/decks  → API (Hono + Drizzle + Neon)
```

The `vercel.json` at the repo root handles this routing automatically:
- `/api/*` → Serverless Edge Function running Hono
- Everything else → Static SPA from `apps/web/dist`

### Subsequent deploys

After the first setup, deploying is just:
```bash
vercel --yes
```

Or push to GitHub — Vercel auto-deploys on every push to `main`.

---

## Manual deploy (without the script)

If you prefer not to use the script:

```bash
# Build frontend
cd apps/web && bun install && bun run build && cd ../..

# Deploy
vercel --yes
```

In the Vercel dashboard, set:
- **Framework Preset**: `Other`
- **Build Command**: `cd apps/web && bun install && bun run build`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `bun install`

---

## Local Development

```bash
# Backend (runs on http://localhost:3001)
bun run --filter server dev

# Frontend (runs on http://localhost:5173, proxies /api to backend)
bun run --filter web dev
```

---

## Database Migrations

```bash
cd apps/server

# Push schema changes directly (recommended for dev)
bun run db:push

# Or generate a migration file
bun run db:generate
bun run db:migrate
```

---

## Architecture

- **Frontend** (`apps/web`): Vite + React 19 + TypeScript + TanStack Router + TanStack Query + Tailwind CSS v4
- **Backend** (`apps/server`): Bun + Hono + Drizzle ORM + Neon PostgreSQL
- **Shared** (`packages/shared`): Zod schemas shared between frontend and backend
