import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password, demo } = body as {
    email?: string;
    password?: string;
    demo?: boolean;
  };

  // Demo access: this is a prototype, so "Continue as Seller One" (or any
  // credentials at all) signs the visitor in as the seeded demo seller.
  // Swap this block out for real credential checking before going to
  // production with real seller accounts.
  if (demo || !email || !password) {
    const seller = await prisma.seller.findUnique({
      where: { email: "seller@boat-lifestyle.in" },
    });
    if (!seller) {
      return NextResponse.json(
        { error: "Demo seller not found. Run `npm run db:seed` first." },
        { status: 500 }
      );
    }
    await createSession({
      sellerId: seller.id,
      sellerCode: seller.sellerCode,
      name: seller.name,
    });
    return NextResponse.json({ ok: true });
  }

  const seller = await prisma.seller.findUnique({ where: { email } });
  if (!seller) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, seller.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession({
    sellerId: seller.id,
    sellerCode: seller.sellerCode,
    name: seller.name,
  });

  return NextResponse.json({ ok: true });
}
