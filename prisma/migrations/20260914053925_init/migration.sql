-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "DecidedByType" AS ENUM ('SELLER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('REQUEST_CREATED', 'APPROVED', 'REJECTED', 'AUTO_APPROVED', 'SLA_SETTING_CHANGED');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "sellerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "rmaId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "decidedAt" TIMESTAMP(3),
    "decidedByType" "DecidedByType",
    "decisionReason" TEXT,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "message" TEXT NOT NULL,
    "actorLabel" TEXT NOT NULL,
    "returnRequestId" TEXT,
    "sellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaSetting" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "windowHours" INTEGER NOT NULL DEFAULT 48,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlaSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_sellerCode_key" ON "Seller"("sellerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_rmaId_key" ON "ReturnRequest"("rmaId");

-- CreateIndex
CREATE INDEX "ReturnRequest_sellerId_status_idx" ON "ReturnRequest"("sellerId", "status");

-- CreateIndex
CREATE INDEX "ReturnRequest_slaDeadline_idx" ON "ReturnRequest"("slaDeadline");

-- CreateIndex
CREATE INDEX "AuditLogEntry_sellerId_createdAt_idx" ON "AuditLogEntry"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLogEntry_returnRequestId_idx" ON "AuditLogEntry"("returnRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "SlaSetting_sellerId_key" ON "SlaSetting"("sellerId");

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaSetting" ADD CONSTRAINT "SlaSetting_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
