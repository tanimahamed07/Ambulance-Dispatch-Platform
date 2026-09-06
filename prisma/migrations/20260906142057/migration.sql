/*
  Warnings:

  - The values [PICKED_UP_AT,HOSPITAL_COMPLETED] on the enum `EmergencyStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "EmergencyStatus_new" AS ENUM ('PENDING', 'DISPATCHING', 'ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'PICKED_UP', 'AT_HOSPITAL', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."emergency_request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "emergency_request" ALTER COLUMN "status" TYPE "EmergencyStatus_new" USING ("status"::text::"EmergencyStatus_new");
ALTER TYPE "EmergencyStatus" RENAME TO "EmergencyStatus_old";
ALTER TYPE "EmergencyStatus_new" RENAME TO "EmergencyStatus";
DROP TYPE "public"."EmergencyStatus_old";
ALTER TABLE "emergency_request" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "paymentGateway" TEXT NOT NULL DEFAULT 'bkash',
    "merchantInvoiceNumber" TEXT NOT NULL,
    "bkashPaymentId" TEXT,
    "bkashTrxId" TEXT,
    "payerReference" TEXT,
    "gatewayResponse" JSONB,
    "tripId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_merchantInvoiceNumber_key" ON "payments"("merchantInvoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bkashPaymentId_key" ON "payments"("bkashPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tripId_key" ON "payments"("tripId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
