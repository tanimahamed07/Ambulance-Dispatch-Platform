/*
  Warnings:

  - You are about to drop the column `contactName` on the `patient_callers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patient_callers" DROP COLUMN "contactName",
ADD COLUMN     "contactNumber" TEXT;
