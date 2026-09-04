/*
  Warnings:

  - Added the required column `callerId` to the `EmergencyRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmergencyRequest" ADD COLUMN     "callerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "patient_callers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
