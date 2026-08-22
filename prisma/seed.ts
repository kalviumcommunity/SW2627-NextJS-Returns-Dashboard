import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const seller = await prisma.seller.upsert({
    where: { email: "seller@boat-lifestyle.in" },
    update: {},
    create: {
      email: "seller@boat-lifestyle.in",
      sellerCode: "IN123456",
      name: "Seller One",
      passwordHash,
    },
  });

  await prisma.slaSetting.upsert({
    where: { sellerId: seller.id },
    update: {},
    create: { sellerId: seller.id, windowHours: 48 },
  });

  // Clear existing demo data so the seed is repeatable
  await prisma.auditLogEntry.deleteMany({ where: { sellerId: seller.id } });
  await prisma.returnRequest.deleteMany({ where: { sellerId: seller.id } });

  const now = Date.now();

  type Seed = {
    rmaId: string;
    orderId: string;
    customerName: string;
    item: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
    requestedHoursAgo: number;
    decidedHoursAgo?: number;
    decidedByType?: "SELLER" | "SYSTEM";
    decisionReason?: string;
  };

  const rows: Seed[] = [
    {
      rmaId: "RMA-784512",
      orderId: "408-1234567-8901234",
      customerName: "Ankit Sharma",
      item: "boAt Rockerz 450",
      reason: "Not working",
      status: "PENDING",
      requestedHoursAgo: 25.5,
    },
    {
      rmaId: "RMA-784511",
      orderId: "408-9876543-2109876",
      customerName: "Neha Verma",
      item: "boAt Airdopes 141",
      reason: "Received wrong item",
      status: "PENDING",
      requestedHoursAgo: 37.25,
    },
    {
      rmaId: "RMA-784510",
      orderId: "407-7654321-0987654",
      customerName: "Rohit Singh",
      item: "boAt Nirvana Ion",
      reason: "Product not as described",
      status: "PENDING",
      requestedHoursAgo: 45.9,
    },
    {
      rmaId: "RMA-784509",
      orderId: "406-1112222-3334444",
      customerName: "Pooja Mehta",
      item: "boAt Watch Storm",
      reason: "No longer needed",
      status: "AUTO_APPROVED",
      requestedHoursAgo: 96,
      decidedHoursAgo: 48,
      decidedByType: "SYSTEM",
    },
    {
      rmaId: "RMA-784508",
      orderId: "405-5556666-7778888",
      customerName: "Vivek Kumar",
      item: "boAt BassHeads 100",
      reason: "Arrived damaged",
      status: "AUTO_APPROVED",
      requestedHoursAgo: 120,
      decidedHoursAgo: 72,
      decidedByType: "SYSTEM",
    },
    {
      rmaId: "RMA-784507",
      orderId: "404-2223333-4445555",
      customerName: "Sneha Rao",
      item: "boAt Stone 650",
      reason: "Not working",
      status: "APPROVED",
      requestedHoursAgo: 150,
      decidedHoursAgo: 144,
      decidedByType: "SELLER",
      decisionReason: "Confirmed defective on inspection photos.",
    },
    {
      rmaId: "RMA-784506",
      orderId: "403-1119999-2228888",
      customerName: "Karan Mehta",
      item: "boAt Rockerz 235",
      reason: "Changed my mind",
      status: "REJECTED",
      requestedHoursAgo: 160,
      decidedHoursAgo: 152,
      decidedByType: "SELLER",
      decisionReason: "Return window for 'changed my mind' claims has expired.",
    },
    {
      rmaId: "RMA-784505",
      orderId: "402-8887777-6665555",
      customerName: "Divya Nair",
      item: "boAt Airdopes 441",
      reason: "Battery drains fast",
      status: "AUTO_APPROVED",
      requestedHoursAgo: 168,
      decidedHoursAgo: 120,
      decidedByType: "SYSTEM",
    },
    {
      rmaId: "RMA-784504",
      orderId: "401-4443333-2221111",
      customerName: "Aditya Joshi",
      item: "boAt Immortal 1000D",
      reason: "Not working",
      status: "APPROVED",
      requestedHoursAgo: 200,
      decidedHoursAgo: 190,
      decidedByType: "SELLER",
      decisionReason: "Verified fault, approving replacement.",
    },
    {
      rmaId: "RMA-784503",
      orderId: "400-7776666-5554444",
      customerName: "Meera Iyer",
      item: "boAt Wave Call",
      reason: "Wrong size strap",
      status: "REJECTED",
      requestedHoursAgo: 220,
      decidedHoursAgo: 210,
      decidedByType: "SELLER",
      decisionReason: "Item is one-size; not eligible under return policy.",
    },
    {
      rmaId: "RMA-784502",
      orderId: "399-3332222-1110000",
      customerName: "Farhan Ali",
      item: "boAt Rockerz 255 Pro+",
      reason: "Not working",
      status: "APPROVED",
      requestedHoursAgo: 240,
      decidedHoursAgo: 230,
      decidedByType: "SELLER",
      decisionReason: "Confirmed defective, refund approved.",
    },
    {
      rmaId: "RMA-784501",
      orderId: "398-5551111-9990000",
      customerName: "Priya Kapoor",
      item: "boAt Airdopes 131",
      reason: "Received wrong item",
      status: "APPROVED",
      requestedHoursAgo: 260,
      decidedHoursAgo: 250,
      decidedByType: "SELLER",
      decisionReason: "Confirmed mismatch with order, refund approved.",
    },
  ];

  for (const row of rows) {
    const requestedAt = new Date(now - row.requestedHoursAgo * HOUR);
    const slaDeadline = new Date(requestedAt.getTime() + 48 * HOUR);
    const decidedAt = row.decidedHoursAgo
      ? new Date(now - row.decidedHoursAgo * HOUR)
      : null;

    const created = await prisma.returnRequest.create({
      data: {
        rmaId: row.rmaId,
        orderId: row.orderId,
        customerName: row.customerName,
        item: row.item,
        reason: row.reason,
        status: row.status,
        requestedAt,
        slaDeadline,
        decidedAt,
        decidedByType: row.decidedByType,
        decisionReason: row.decisionReason,
        sellerId: seller.id,
      },
    });

    await prisma.auditLogEntry.create({
      data: {
        action: "REQUEST_CREATED",
        message: `Return requested by ${row.customerName} for ${row.item} (${row.reason}).`,
        actorLabel: row.customerName,
        returnRequestId: created.id,
        sellerId: seller.id,
        createdAt: requestedAt,
      },
    });

    if (row.status !== "PENDING" && decidedAt) {
      const action =
        row.status === "APPROVED"
          ? "APPROVED"
          : row.status === "REJECTED"
          ? "REJECTED"
          : "AUTO_APPROVED";
      const actorLabel = row.decidedByType === "SYSTEM" ? "System" : seller.name;
      await prisma.auditLogEntry.create({
        data: {
          action,
          message:
            row.decidedByType === "SYSTEM"
              ? `Return ${row.rmaId} auto-approved after SLA window elapsed with no seller decision.`
              : `Return ${row.rmaId} ${row.status.toLowerCase()} by ${seller.name}${
                  row.decisionReason ? `: ${row.decisionReason}` : ""
                }`,
          actorLabel,
          returnRequestId: created.id,
          sellerId: seller.id,
          createdAt: decidedAt,
        },
      });
    }
  }

  console.log(`Seeded seller ${seller.email} (login with password: demo1234)`);
  console.log(`Seeded ${rows.length} return requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
