# HyperBoard Studio

AI-powered interactive blackboard for STEM teachers (Math, Physics, Chemistry).

## Stack

- **Monorepo:** pnpm + Turborepo
- **Web / Console:** Next.js 15 (App Router) + Tailwind CSS
- **API:** Elysia.js on Bun
- **DB:** MongoDB (local by default)
- **AI:** OpenAI `gpt-4o-mini` (30 modular STEM features)
- **Storage:** Cloudflare R2 snapshots

## Apps

| App | Port | Path |
|-----|------|------|
| Web | 4000 | `apps/web` |
| API | 3001 | `apps/api` |
| Console | 3002 | `apps/console` |

## Quick start

```bash
# requires: Node 20+, pnpm, Bun, local MongoDB running
pnpm install
pnpm run dev
```

Open:

- Web: http://localhost:4000
- API health: http://localhost:3001/health
- Console: http://localhost:3002

Google OAuth (web):
- Start: `/api/auth/google`
- Callback: `http://localhost:4000/api/auth/google-callback`
- Complete: `/auth/google-oauth-callback`

Add Authorized JavaScript origin: `http://localhost:4000`

## Environment

Copy examples and fill secrets (already gitignored):

- `apps/api/.env`
- `apps/web/.env.local`
- `apps/console/.env.local`

Google OAuth: add `http://localhost:3000` to authorized JavaScript origins in Google Cloud Console.

## AI features (30)

10 each for Math, Physics, Chemistry — see `@smart-desk/types` `AI_FEATURES`.
# HyberBoard
