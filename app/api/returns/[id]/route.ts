import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { runAutoApprovalSweep } from "@/lib/sla";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runAutoApprovalSweep(session.sellerId);

  const ret = await prisma.returnRequest.findFirst({
    where: { id: params.id, sellerId: session.sellerId },
    include: {
      auditLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ret) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ return: ret });
}
