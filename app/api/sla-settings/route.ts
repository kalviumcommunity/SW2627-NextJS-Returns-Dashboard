import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const setting = await prisma.slaSetting.findUnique({ where: { sellerId: session.sellerId } });
  return NextResponse.json({ windowHours: setting?.windowHours ?? 48 });
}

// Note: changing this setting only affects the SLA deadline of *future*
// return requests, so historical decisions and their audit trail stay
// consistent with the window that was actually in effect at the time.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const windowHours = Number(body.windowHours);

  if (!Number.isFinite(windowHours) || windowHours < 1 || windowHours > 720) {
    return NextResponse.json(
      { error: "windowHours must be a number between 1 and 720." },
      { status: 400 }
    );
  }

  const [setting] = await prisma.$transaction([
    prisma.slaSetting.upsert({
      where: { sellerId: session.sellerId },
      update: { windowHours },
      create: { sellerId: session.sellerId, windowHours },
    }),
    prisma.auditLogEntry.create({
      data: {
        action: "SLA_SETTING_CHANGED",
        message: `SLA auto-approval window changed to ${windowHours}h by ${session.name}.`,
        actorLabel: session.name,
        sellerId: session.sellerId,
      },
    }),
  ]);

  return NextResponse.json({ windowHours: setting.windowHours });
}
