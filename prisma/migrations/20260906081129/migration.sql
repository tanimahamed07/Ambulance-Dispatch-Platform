/*
  Warnings:

  - The values [PICKED,UP_AT] on the enum `EmergencyStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmergencyStatus_new" AS ENUM ('PENDING', 'DISPATCHING', 'ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'PICKED_UP_AT', 'HOSPITAL_COMPLETED', 'CANCELLED');
ALTER TABLE "public"."emergency_request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "emergency_request" ALTER COLUMN "status" TYPE "EmergencyStatus_new" USING ("status"::text::"EmergencyStatus_new");
ALTER TYPE "EmergencyStatus" RENAME TO "EmergencyStatus_old";
ALTER TYPE "EmergencyStatus_new" RENAME TO "EmergencyStatus";
DROP TYPE "public"."EmergencyStatus_old";
ALTER TABLE "emergency_request" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
