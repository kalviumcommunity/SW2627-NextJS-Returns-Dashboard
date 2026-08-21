import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { runAutoApprovalSweep } from "@/lib/sla";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runAutoApprovalSweep(session.sellerId);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const logs = await prisma.auditLogEntry.findMany({
    where: { sellerId: session.sellerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      returnRequest: {
        select: { rmaId: true, customerName: true, item: true },
      },
    },
  });

  return NextResponse.json({ logs });
}
