/*
  Warnings:

  - You are about to drop the `EmergencyRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmergencyRequest" DROP CONSTRAINT "EmergencyRequest_callerId_fkey";

-- DropTable
DROP TABLE "EmergencyRequest";

-- CreateTable
CREATE TABLE "emergency_request" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "emergencyType" "EmergencyType" NOT NULL,
    "description" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "callerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emergency_request" ADD CONSTRAINT "emergency_request_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "patient_callers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
