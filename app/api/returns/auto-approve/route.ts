import { NextRequest, NextResponse } from "next/server";
import { runAutoApprovalSweep } from "@/lib/sla";

// POST /api/returns/auto-approve
// Intended to be hit on a schedule (GCP Cloud Scheduler, or a GitHub Actions
// cron workflow) so the SLA engine runs even with no traffic. Protected by
// a shared secret rather than a seller session, since it's a machine caller.
//
//   curl -X POST https://your-app/api/returns/auto-approve \
//     -H "Authorization: Bearer $CRON_SECRET"
export async function POST(req: NextRequest) {
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
