/*
  Warnings:

  - The values [PAID] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bkashPaymentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `bkashTrxId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayResponse` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bkashPaymentID]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('UNPAID', 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
ALTER TABLE "public"."payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'UNPAID';
COMMIT;

-- DropIndex
DROP INDEX "payments_bkashPaymentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "bkashPaymentId",
DROP COLUMN "bkashTrxId",
DROP COLUMN "gatewayResponse",
DROP COLUMN "paidAt",
ADD COLUMN     "bkashPaymentID" TEXT,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "paymentCreateTime" TIMESTAMP(3),
ADD COLUMN     "paymentExecuteTime" TIMESTAMP(3),
ADD COLUMN     "trxID" TEXT,
ALTER COLUMN "merchantInvoiceNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_bkashPaymentID_key" ON "payments"("bkashPaymentID");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
