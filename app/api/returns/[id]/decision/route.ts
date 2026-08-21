import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { runAutoApprovalSweep } from "@/lib/sla";

// POST /api/returns/:id/decision   body: { decision: "APPROVED" | "REJECTED", reason?: string }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { decision, reason } = body as { decision?: string; reason?: string };

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json(
      { error: "decision must be APPROVED or REJECTED" },
      { status: 400 }
    );
  }

  if (decision === "REJECTED" && (!reason || !reason.trim())) {
    return NextResponse.json(
      { error: "A reason is required to reject a return." },
      { status: 400 }
    );
  }

  // Run the sweep first: if this return already tipped over its SLA
  // deadline and got auto-approved, the seller shouldn't be able to
  // silently overwrite that outcome.
  await runAutoApprovalSweep(session.sellerId);

  const ret = await prisma.returnRequest.findFirst({
    where: { id: params.id, sellerId: session.sellerId },
  });

  if (!ret) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ret.status !== "PENDING") {
    return NextResponse.json(
      { error: `This return is already ${ret.status.replace("_", " ").toLowerCase()}.` },
      { status: 409 }
    );
  }

  const now = new Date();

  const [updated] = await prisma.$transaction([
    prisma.returnRequest.update({
      where: { id: ret.id },
      data: {
        status: decision,
        decidedAt: now,
        decidedByType: "SELLER",
        decisionReason: reason?.trim() || null,
      },
    }),
    prisma.auditLogEntry.create({
      data: {
        action: decision,
        message: `Return ${ret.rmaId} ${decision.toLowerCase()} by ${session.name}${
          reason ? `: ${reason.trim()}` : ""
        }`,
        actorLabel: session.name,
        returnRequestId: ret.id,
        sellerId: session.sellerId,
        createdAt: now,
      },
    }),
  ]);

  return NextResponse.json({ return: updated });
}
