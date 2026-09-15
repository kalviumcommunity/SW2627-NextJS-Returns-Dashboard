# Returns Dashboard — Amazon.in Seller Central

Sellers approve/reject return requests with a reason. If a seller doesn't respond within a
configurable SLA window (default 48h), the return auto-approves. Every decision — seller or
system — is written to an immutable audit trail visible to Customer Support in a read-only view.

**Live app:** _add your production Vercel URL here_

## Stack / request path

```
Browser → Next.js API route (App Router) → Prisma → PostgreSQL → JSON response
                                                         ↑
                          Vercel builds & deploys on every push to main
                     (Vercel Cron calls the auto-approve endpoint every 15 min)
```

- **Next.js 14 (App Router, TypeScript)** — UI pages + API routes in one app
- **Prisma** — schema, migrations, typed queries against PostgreSQL
- **PostgreSQL** — source of truth (any managed Postgres reachable from Vercel — Neon, Supabase,
  or Vercel Postgres all work; see [Deploying to Vercel](#deploying-to-vercel))
- **jose + httpOnly cookies** — session auth (no external auth provider needed for the demo)
- **Tailwind CSS** — styling, matched to the Seller Central visual language
- **Vercel** — hosting, CI/CD (Git integration), and the scheduled SLA sweep (Vercel Cron)

## Where things break (and how this handles it)

| Component | What breaks | How it's handled here |
|---|---|---|
| Browser → API | Bad input, no session | Every route checks `getSession()` first; 401 on missing/expired cookie; input is validated before touching the DB (e.g. a reject requires a reason) |
| API → Prisma → Postgres | Race: seller clicks Approve right as the SLA sweep auto-approves the same row | The decision route re-runs the sweep *then* re-fetches the row and rejects the seller's action with 409 if it's no longer `PENDING` |
| SLA engine | Vercel Cron doesn't fire, or fires late | The sweep also runs opportunistically on every `GET /api/returns`, `GET /api/returns/:id`, and `GET /api/audit-logs` call, so the UI is never stale even if the scheduled job is delayed |
| Deploy pipeline | Migration fails during a deploy | `prisma migrate deploy` runs as part of the build step (`npm run build`), *before* `next build` compiles the app — if the migration fails, the build fails and Vercel keeps serving the previous, still-working deployment |
| Everything | Any request | All mutation is wrapped in `prisma.$transaction(...)` so the status change and its audit log entry are written atomically — you never get one without the other |

## Local setup

```bash
cp .env.example .env
# edit .env: set DATABASE_URL to a local/dev Postgres instance,
# and set AUTH_SECRET to any random string (openssl rand -base64 32)

npm install
npx prisma migrate dev --name init   # creates tables
npm run db:seed                      # loads the demo seller + 12 sample returns
npm run dev
```

Visit `http://localhost:3000` → you'll be redirected to `/login`. Click **Continue as Seller One**,
or sign in with `seller@boat-lifestyle.in` / `demo1234`.

## Key routes

| Route | Purpose |
|---|---|
| `/dashboard` | Returns Dashboard — stat cards, pending queue with Approve/Reject actions |
| `/dashboard/all-returns` | Every return, any status |
| `/dashboard/auto-approved`, `/approved`, `/rejected` | Filtered views |
| `/dashboard/support` | Customer Support View — read-only, click a row to see full detail + audit trail |
| `/dashboard/audit-logs` | Full chronological audit trail |
| `/dashboard/sla-settings` | Change the auto-approval window (hours) |
| `GET`/`POST /api/returns/auto-approve` | Cron target — sweeps and auto-approves expired returns. Protected by `Authorization: Bearer $CRON_SECRET` |

## Deploying to Vercel

This repo deploys to Vercel as a standard Next.js App Router project — no Dockerfile or custom
build server needed for this path (the `Dockerfile` in this repo is kept for an alternative
container-based deployment target and is unused by Vercel).

### 1. Import the project
Connect the GitHub repo in the Vercel dashboard (**Add New → Project**). Vercel auto-detects
Next.js and configures the build for you. Every push to `main` triggers a production deploy;
every other branch/PR gets its own preview deployment automatically — this *is* the CI/CD
pipeline for this path, no separate workflow file required.

### 2. Set environment variables
In **Project Settings → Environment Variables**, add:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Connection string for your managed Postgres (Neon, Supabase, or Vercel Postgres). Set for **Production** at minimum. |
| `AUTH_SECRET` | Random string, e.g. `openssl rand -base64 32`. |
| `CRON_SECRET` | Random string, e.g. `openssl rand -base64 32`. **Must be named exactly `CRON_SECRET`** — Vercel automatically sends it as `Authorization: Bearer $CRON_SECRET` when invoking your cron endpoints, which is exactly what `/api/returns/auto-approve` checks for. |

> **Preview deployments and `DATABASE_URL`:** if you also set `DATABASE_URL` for the Preview
> environment, every PR preview will run `prisma migrate deploy` against that same database on
> build. Either point Preview at a separate/disposable database, or leave `DATABASE_URL` scoped
> to Production only until you set one up.

### 3. The build step runs migrations automatically
`package.json`'s `build` script is `prisma migrate deploy && next build` — Vercel runs this on
every deploy, so any new migration in `prisma/migrations/` is applied to the target database
before the new code goes live. If a migration fails, the build fails and the currently-live
deployment is left untouched (Vercel never swaps traffic to a failed build).

### 4. The SLA sweep runs on a schedule automatically
`vercel.json` registers a Vercel Cron Job:
```json
{
  "crons": [{ "path": "/api/returns/auto-approve", "schedule": "*/15 * * * *" }]
}
```
> **Plan limits:** Vercel's Hobby (free) plan caps cron jobs at once per day; the 15-minute
> schedule above requires a Pro plan or higher. On Hobby, either widen the schedule to
> `0 0 * * *` (once daily) or skip the cron entirely — the opportunistic sweep on every dashboard
> page load still catches overdue returns whenever anyone actually opens the app, just not while
> it's sitting completely idle.

### 5. Seed data (optional, one-time)
Run this from your own machine, pointed at the production `DATABASE_URL`, after your first deploy:
```bash
DATABASE_URL="your-production-connection-string" npm run db:seed
```

## Notes on this build

- `npm install` and `prisma generate` need real internet access to `binaries.prisma.sh` to
  download Prisma's query engine. Vercel's build environment has unrestricted internet access, so
  this resolves automatically there — it's only a concern in network-restricted local/CI sandboxes.
- The demo login accepts any credentials and signs you in as the seeded "Seller One" account —
  intentional for a prototype; swap the `demo` branch out of `app/api/auth/login/route.ts` before
  connecting real seller accounts.
- A GitHub Actions workflow targeting GCP Cloud Run (`.github/workflows/deploy.yml`) is kept in
  this repo as an alternative deployment path — it is not used by the Vercel deployment and can be
  deleted if you don't intend to also deploy to GCP.
