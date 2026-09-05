-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DISPATCHED', 'EN_ROUTE', 'PICKED_UP', 'AT_HOSPITAL', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "hospitalId" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'DISPATCHED',
    "startedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "hospitalArrivalAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "distanceKm" DOUBLE PRECISION,
    "fare" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_emergencyId_key" ON "Trip"("emergencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_dispatchId_key" ON "Trip"("dispatchId");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergency_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
