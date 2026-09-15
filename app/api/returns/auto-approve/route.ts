import { NextRequest, NextResponse } from "next/server";
import { runAutoApprovalSweep } from "@/lib/sla";

// GET/POST /api/returns/auto-approve
// Intended to be hit on a schedule (Vercel Cron Jobs, GCP Cloud Scheduler, or
// a GitHub Actions cron workflow) so the SLA engine runs even with no
// traffic. Protected by a shared secret rather than a seller session, since
// it's a machine caller, not a logged-in user.
//
// Vercel Cron Jobs invoke this via GET and — if an env var literally named
// CRON_SECRET is set on the project — automatically attach it as
// `Authorization: Bearer $CRON_SECRET`, which is exactly what this check
// expects. GitHub Actions / curl-based schedulers can call it via POST:
//
//   curl -X POST https://your-app/api/returns/auto-approve \
//     -H "Authorization: Bearer $CRON_SECRET"
async function handleSweep(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runAutoApprovalSweep();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handleSweep(req);
}

export async function POST(req: NextRequest) {
  return handleSweep(req);
}
