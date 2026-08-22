import { prisma } from "@/lib/prisma";

export const DEFAULT_SLA_HOURS = 48;

/**
 * The core "SLA engine": finds every PENDING return whose deadline has
 * passed and flips it to AUTO_APPROVED, writing an audit log entry for each.
 *
 * This is safe to call as often as you like (idempotent) — it only touches
 * rows that are still PENDING and past their deadline. In production this
 * is invoked:
 *   1. Opportunistically on every dashboard/API read (so the UI is always
 *      correct even if the cron hasn't fired yet), and
 *   2. On a schedule via GitHub Actions / GCP Cloud Scheduler hitting
 *      POST /api/returns/auto-approve
 */
export async function runAutoApprovalSweep(sellerId?: string) {
  const now = new Date();

  const expired = await prisma.returnRequest.findMany({
    where: {
      status: "PENDING",
      slaDeadline: { lte: now },
      ...(sellerId ? { sellerId } : {}),
    },
  });

  if (expired.length === 0) return { autoApprovedCount: 0, ids: [] as string[] };

  for (const ret of expired) {
    await prisma.$transaction([
      prisma.returnRequest.update({
        where: { id: ret.id },
        data: {
          status: "AUTO_APPROVED",
          decidedAt: now,
          decidedByType: "SYSTEM",
          decisionReason: "Auto-approved: no seller action within the SLA window.",
        },
      }),
      prisma.auditLogEntry.create({
        data: {
          action: "AUTO_APPROVED",
          message: `Return ${ret.rmaId} auto-approved after SLA window elapsed with no seller decision.`,
          actorLabel: "System",
          returnRequestId: ret.id,
          sellerId: ret.sellerId,
        },
      }),
    ]);
  }

  return {
    autoApprovedCount: expired.length,
    ids: expired.map((r: { id: string }) => r.id),
  };
}

export function msToHoursMinutes(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}
