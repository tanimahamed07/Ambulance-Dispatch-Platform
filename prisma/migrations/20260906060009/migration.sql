/*
  Warnings:

  - You are about to drop the `_HospitalToTrip` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_HospitalToTrip" DROP CONSTRAINT "_HospitalToTrip_A_fkey";

-- DropForeignKey
ALTER TABLE "_HospitalToTrip" DROP CONSTRAINT "_HospitalToTrip_B_fkey";

-- AlterTable
ALTER TABLE "hospitals" ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "_HospitalToTrip";

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
