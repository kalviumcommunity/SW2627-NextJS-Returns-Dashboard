# Returns Dashboard — Amazon.in Seller Central

Sellers approve/reject return requests with a reason. If a seller doesn't respond within a
configurable SLA window (default 48h), the return auto-approves. Every decision — seller or
system — is written to an immutable audit trail visible to Customer Support in a read-only view.

## Stack / request path

```
Browser → Next.js API route (App Router) → Prisma → PostgreSQL → JSON response
                                                         ↑
                        GitHub Actions builds, migrates, and deploys to GCP Cloud Run
                        (and pings the auto-approve endpoint on a 15-min schedule)
```

- **Next.js 14 (App Router, TypeScript)** — UI pages + API routes in one app
- **Prisma** — schema, migrations, typed queries against PostgreSQL
- **PostgreSQL** — source of truth (Cloud SQL in production)
- **jose + httpOnly cookies** — session auth (no external auth provider needed for the demo)
- **Tailwind CSS** — styling, matched to the Seller Central visual language
- **GitHub Actions → Docker → GCP Cloud Run** — CI/CD, plus a scheduled SLA sweep

## Where things break (and how this handles it)

| Component | What breaks | How it's handled here |
|---|---|---|
| Browser → API | Bad input, no session | Every route checks `getSession()` first; 401 on missing/expired cookie; input is validated before touching the DB (e.g. a reject requires a reason) |
| API → Prisma → Postgres | Race: seller clicks Approve right as the SLA sweep auto-approves the same row | The decision route re-runs the sweep *then* re-fetches the row and rejects the seller's action with 409 if it's no longer `PENDING` |
| SLA engine | Cron/schedule doesn't fire, or fires late | The sweep also runs opportunistically on every `GET /api/returns`, `GET /api/returns/:id`, and `GET /api/audit-logs` call, so the UI is never stale even if the scheduled job is delayed |
| Deploy pipeline | Migration fails mid-deploy | `prisma migrate deploy` runs as its own workflow step *before* the Cloud Run deploy step — if it fails, the old revision keeps serving traffic |
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
| `POST /api/returns/auto-approve` | Cron target — sweeps and auto-approves expired returns. Protected by `Authorization: Bearer $CRON_SECRET` |

## Deploying to GCP

The included `Dockerfile` builds a `next build --standalone` image. `.github/workflows/deploy.yml`:

1. Builds the image and pushes it to Artifact Registry
2. Runs `prisma migrate deploy` against Cloud SQL using the built image
3. Deploys the new image to Cloud Run
4. On a 15-minute schedule, calls `POST /api/returns/auto-approve` so the SLA engine keeps
   running even with no user traffic

You'll need these repo secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`,
`GCP_SERVICE_ACCOUNT`, `DATABASE_URL`, `DATABASE_URL_SECRET_NAME` (a Secret Manager secret name),
`AUTH_SECRET`, `CRON_SECRET`, `APP_URL`.

## Notes on this build

- `npm install` and `prisma generate` need real internet access to `binaries.prisma.sh` to
  download Prisma's query engine — this was verified with `tsc --noEmit` against the full
  source tree instead (0 errors outside the two expected "run `prisma generate` first" stubs).
  Run `npm install` normally in your own environment and it will complete automatically via the
  `postinstall` script.
- The demo login accepts any credentials and signs you in as the seeded "Seller One" account —
  intentional for a prototype; swap the `demo` branch out of `app/api/auth/login/route.ts`
  before connecting real seller accounts.
