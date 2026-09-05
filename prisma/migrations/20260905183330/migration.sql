/*
  Warnings:

  - You are about to drop the column `cancellationReason` on the `dispatches` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `dispatches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dispatches" DROP COLUMN "cancellationReason",
DROP COLUMN "cancelledAt";
