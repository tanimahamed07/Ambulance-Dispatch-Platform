-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('ACCIDENT', 'CARDIAC', 'STROKE', 'PREGNANCY', 'TRAUMA', 'BREATHING_PROBLEM', 'OTHER');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('PENDING', 'DISPATCHING', 'ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'PICKED', 'UP_AT', 'HOSPITAL_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- DropEnum
DROP TYPE "DriverDutyStatus";

-- CreateTable
CREATE TABLE "EmergencyRequest" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyRequest_pkey" PRIMARY KEY ("id")
);
