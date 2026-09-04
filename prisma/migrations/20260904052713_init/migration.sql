-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'CALLER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "DriverApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('INVALID_LICENSE', 'EXPIRED_LICENSE', 'INVALID_NID', 'DOCUMENT_UNCLEAR', 'AGE_RESTRICTION', 'SUSPENDED_PROFILE', 'OTHER');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'CREDENTIAL');

-- CreateEnum
CREATE TYPE "AmbulanceStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'ON_TRIP', 'MAINTENANCE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AmbulanceType" AS ENUM ('AC', 'NON_AC', 'ICU', 'FREEZER', 'AIR');

-- CreateEnum
CREATE TYPE "DriverDutyStatus" AS ENUM ('OFF_DUTY', 'AVAILABLE', 'ON_DISPATCH', 'ON_TRIP');

-- CreateTable
CREATE TABLE "ambulances" (
    "id" TEXT NOT NULL,
    "ambulanceNumber" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "registrationExpiry" TIMESTAMP(3) NOT NULL,
    "vehicleType" "AmbulanceType" NOT NULL DEFAULT 'AC',
    "model" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "status" "AmbulanceStatus" NOT NULL DEFAULT 'OFFLINE',
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_callers" (
    "id" TEXT NOT NULL,
    "contactNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bloodGroup" "BloodGroup",
    "gender" "Gender",
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "patient_callers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseUrl" TEXT NOT NULL,
    "licensePublicId" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "nidNumber" TEXT NOT NULL,
    "approvalStatus" "DriverApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "rejectionReason" "RejectionReason",
    "rejectionNote" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "ambulanceId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'CALLER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "googleId" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIAL',
    "profileUrl" TEXT NOT NULL DEFAULT '',
    "profilePublicId" TEXT NOT NULL DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_ambulanceNumber_key" ON "ambulances"("ambulanceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_registrationNumber_key" ON "ambulances"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "patient_callers_userId_key" ON "patient_callers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_nidNumber_key" ON "drivers"("nidNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_ambulanceId_key" ON "drivers"("ambulanceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- AddForeignKey
ALTER TABLE "patient_callers" ADD CONSTRAINT "patient_callers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
