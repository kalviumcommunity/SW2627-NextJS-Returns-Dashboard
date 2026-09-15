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

  try {
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
  } catch (err) {
    // Without this catch, any thrown error here (a bad/missing DATABASE_URL,
    // an unreachable database, a missing table because migrations haven't
    // run, etc.) becomes an unhandled exception. Vercel then returns a raw
    // platform-level error page instead of JSON, `res.json()` on the client
    // throws, and the login page shows the generic "Couldn't reach the
    // server" message — hiding the actual cause. Logging it here means the
    // real error shows up in Vercel's function logs, and callers still get
    // back valid JSON either way.
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: "Something went wrong signing you in. Please try again." },
      { status: 500 }
    );
  }
}
