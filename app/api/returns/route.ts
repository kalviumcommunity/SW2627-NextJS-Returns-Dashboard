import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { runAutoApprovalSweep } from "@/lib/sla";

// GET /api/returns?status=PENDING&search=RMA-784512
// Every read opportunistically runs the auto-approval sweep first, so the
// list is always consistent even if the scheduled cron job is delayed.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runAutoApprovalSweep(session.sellerId);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING | APPROVED | REJECTED | AUTO_APPROVED
  const search = searchParams.get("search")?.trim();

  const returns = await prisma.returnRequest.findMany({
    where: {
      sellerId: session.sellerId,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { rmaId: { contains: search, mode: "insensitive" } },
              { orderId: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ returns });
}

// POST /api/returns
// Simulates a customer opening a return request (in a full system this
// would be called by the storefront/order-management service). Stamps the
// SLA deadline using the seller's *current* SlaSetting.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { orderId, customerName, item, reason } = body as Record<string, string>;

  if (!orderId || !customerName || !item || !reason) {
    return NextResponse.json(
      { error: "orderId, customerName, item, and reason are all required." },
      { status: 400 }
    );
  }

  const setting = await prisma.slaSetting.findUnique({ where: { sellerId: session.sellerId } });
  const windowHours = setting?.windowHours ?? 48;

  const last = await prisma.returnRequest.findFirst({
    orderBy: { rmaId: "desc" },
  });
  const nextNumber = last ? parseInt(last.rmaId.replace("RMA-", ""), 10) + 1 : 784513;
  const rmaId = `RMA-${nextNumber}`;

  const requestedAt = new Date();
  const slaDeadline = new Date(requestedAt.getTime() + windowHours * 60 * 60 * 1000);

  const [created] = await prisma.$transaction([
    prisma.returnRequest.create({
      data: {
        rmaId,
        orderId,
        customerName,
        item,
        reason,
        status: "PENDING",
        requestedAt,
        slaDeadline,
        sellerId: session.sellerId,
      },
    }),
  ]);

  await prisma.auditLogEntry.create({
    data: {
      action: "REQUEST_CREATED",
      message: `Return requested by ${customerName} for ${item} (${reason}).`,
      actorLabel: customerName,
      returnRequestId: created.id,
      sellerId: session.sellerId,
    },
  });

  return NextResponse.json({ return: created }, { status: 201 });
}
