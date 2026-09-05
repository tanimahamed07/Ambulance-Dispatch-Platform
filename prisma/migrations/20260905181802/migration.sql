/*
  Warnings:

  - You are about to drop the column `currentLatitude` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `currentLongitude` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the `Dispatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_ambulanceId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_emergencyId_fkey";

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "currentLatitude",
DROP COLUMN "currentLongitude";

-- DropTable
DROP TABLE "Dispatch";

-- CreateTable
CREATE TABLE "dispatches" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "ambulanceId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "dispatchedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispatches_emergencyId_key" ON "dispatches"("emergencyId");

-- CreateIndex
CREATE INDEX "dispatches_ambulanceId_idx" ON "dispatches"("ambulanceId");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergency_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
