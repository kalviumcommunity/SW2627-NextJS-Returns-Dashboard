import { NextRequest, NextResponse } from "next/server";
import { runAutoApprovalSweep } from "@/lib/sla";

// GET / POST /api/returns/auto-approve
// Hit on a schedule (Vercel Cron makes GET requests, GCP/manual can make POST)
// so the SLA engine runs even with no traffic. Protected by CRON_SECRET.
async function handleAutoApprove(req: NextRequest) {
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
  return handleAutoApprove(req);
}

export async function POST(req: NextRequest) {
  return handleAutoApprove(req);
}

