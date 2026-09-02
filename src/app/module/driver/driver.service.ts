import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  IApplyAsDriverPayload,
  IApproveDriverPayload,
} from "./driver.interface";
import { IRequestUser } from "../auth/auth.interface";
import { DriverApprovalStatus, Role } from "../../../generated/prisma/enums";
import { differenceInDays } from "date-fns";

const applyAsDriver = async (
  payload: IApplyAsDriverPayload,
  user: IRequestUser,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId, isDeleted: false },
    include: { driver: true },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (existingUser.driver) {
    const { approvalStatus, rejectedAt, id } = existingUser.driver;

    if (approvalStatus === DriverApprovalStatus.PENDING) {
      throw new AppError(
        httpStatus.CONFLICT,
        "You already have a pending driver application.",
      );
    }

    if (approvalStatus === DriverApprovalStatus.APPROVED) {
      throw new AppError(
        httpStatus.CONFLICT,
        "You are already an approved driver.",
      );
    }

    if (approvalStatus === DriverApprovalStatus.REJECTED && rejectedAt) {
      const daysPassed = differenceInDays(new Date(), new Date(rejectedAt));

      if (daysPassed < 3) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Your application was rejected. Please wait at least 3 days before re-applying.",
        );
      }

      return await prisma.driver.update({
        where: { id },
        data: {
          contactNumber: payload.contactNumber,
          address: payload.address as string,
          licenseNumber: payload.licenseNumber as string,
          licenseUrl: payload.licenseUrl as string,
          licensePublicId: payload.licensePublicId as string,
          licenseExpiry: new Date(payload.licenseExpiry),
          nidNumber: payload.nidNumber as string,
          approvalStatus: DriverApprovalStatus.PENDING,
          rejectionReason: null,
          rejectionNote: null,
          rejectedAt: null,
        },
      });
    }
  }

  const driverApplication = await prisma.driver.create({
    data: {
      userId: user.userId,
      contactNumber: payload.contactNumber,
      address: payload.address as string,
      licenseNumber: payload.licenseNumber as string,
      licenseUrl: payload.licenseUrl as string,
      licensePublicId: payload.licensePublicId as string,
      licenseExpiry: new Date(payload.licenseExpiry),
      nidNumber: payload.nidNumber as string,
      approvalStatus: DriverApprovalStatus.PENDING,
    },
  });

  return driverApplication;
};

const approveDriver = async (payload: IApproveDriverPayload) => {
  const { driverId, approvalStatus, rejectionReason, rejectionNote } = payload;

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

  if (driver.approvalStatus === DriverApprovalStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This driver is already approved.",
    );
  }

  let updatedDriver;

  if (approvalStatus === DriverApprovalStatus.APPROVED) {
    // Handle Approval Logic
    updatedDriver = await prisma.$transaction(async (tx) => {
      const updateDriverStatus = await tx.driver.update({
        where: { id: driverId },
        data: {
          approvalStatus: DriverApprovalStatus.APPROVED,
          rejectionReason: null,
          rejectionNote: null,
          rejectedAt: null,
        },
      });

      await tx.user.update({
        where: { id: driver.userId },
        data: { role: Role.DRIVER },
      });

      return updateDriverStatus;
    });
  } else if (approvalStatus === DriverApprovalStatus.REJECTED) {
    // Handle Rejection Logic using your Prisma schema tracking fields
    if (!rejectionReason) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rejection reason is required.",
      );
    }

    updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        approvalStatus: DriverApprovalStatus.REJECTED,
        rejectionReason,
        rejectionNote: rejectionNote || null,
        rejectedAt: new Date(),
      },
    });
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid approval status provided.",
    );
  }

  return updatedDriver;
};

export const DriverService = {
  applyAsDriver,
  approveDriver,
};
