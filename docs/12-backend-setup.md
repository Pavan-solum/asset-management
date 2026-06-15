# Backend Setup — Neon / Supabase + Vercel

Assetly can persist data in **PostgreSQL** using either:

| Platform | What you get | Best for |
|----------|--------------|----------|
| **[Neon](https://console.neon.tech/)** | Serverless Postgres | Pair with Vercel API routes (this repo) |
| **[Supabase](https://supabase.com/)** | Postgres + Auth + Storage | Same SQL schema; use Supabase connection string |

Both use standard PostgreSQL. The API in `/api` connects via `DATABASE_URL`.

---

## Architecture

```
Browser (Assetly SPA on Vercel)
    ↓  /api/*
Vercel Serverless (Edge + Neon driver)
    ↓  DATABASE_URL
Neon or Supabase Postgres
```

When `VITE_USE_API=true`, the frontend loads and saves assets through the API instead of in-memory Redux only.

---

## Step 1 — Create a database

### Option A: Neon (recommended with Vercel)

1. Go to [console.neon.tech](https://console.neon.tech/) → **New Project**
2. Copy the **pooled connection string** (starts with `postgresql://`)
3. Save it — this is your `DATABASE_URL`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com/) → **New project**
2. **Project Settings → Database → Connection string → URI**
3. Use the **Session pooler** or **Transaction pooler** URI as `DATABASE_URL`

---

## Step 2 — Run the schema

In the SQL editor (Neon or Supabase):

1. Run `database/supabase/001_assetly_schema.sql`
2. Run `database/supabase/002_assetly_seed.sql`

This creates tables and seeds the Acme Corp demo tenant, departments, and vendors.

---

## Step 3 — Configure environment variables

### Vercel (Production)

In **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Neon/Supabase Postgres URI |
| `VITE_USE_API` | `true` |

Redeploy after adding variables.

### Local development

```powershell
# Repo root — for API (vercel dev)
copy .env.example .env
# Edit .env and set DATABASE_URL

# Frontend
copy apps\web\.env.example apps\web\.env
# Set VITE_USE_API=true
```

Run full stack locally:

```powershell
npm install
npm run dev:full
```

This starts the Vite app + `/api` routes on `http://localhost:3000`.

---

## Step 4 — Verify

1. Open `https://your-app.vercel.app/api/health`  
   Expected: `{ "status": "ok", "database": "connected" }`

2. Log in to Assetly → data loads from Postgres (banner: “Loading data from database…”)

3. Add an asset or import Excel → refresh the page → data should **persist**

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | DB connectivity check |
| GET | `/api/sync` | Load all tenant data |
| GET | `/api/assets` | List assets + assignments + history |
| POST | `/api/assets` | Create asset |
| GET/PATCH/DELETE | `/api/assets/:id` | Asset by ID (public GET for QR lookup) |
| POST | `/api/assets/import` | Replace inventory (Excel import) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL is not configured` | Add env var in Vercel and redeploy |
| `Backend unavailable` on login | Run SQL migrations; check connection string includes `?sslmode=require` |
| Data still disappears | Ensure `VITE_USE_API=true` was set **before** build (redeploy) |
| Import fails on vendor FK | Run seed SQL so vendor UUIDs exist |
| Local API 404 | Use `npm run dev:full` (not `npm run dev` alone) |

---

## Security notes (production)

- Current demo uses permissive RLS policies for simplicity
- Add authentication to API routes before production use
- Never expose `DATABASE_URL` in frontend env vars
- Tighten Supabase RLS or use Neon with server-side API only

---

## Next steps

- [ ] Supabase Auth instead of demo login
- [ ] Supabase Storage for asset images (replace base64)
- [ ] Multi-tenant RLS with JWT claims
- [ ] NestJS API (see `docs/04-api-specification.md`) for full enterprise features
