import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  IApplyAsDriverPayload,
  IApproveDriverPayload,
} from "./driver.interface";
import { IRequestUser } from "../auth/auth.interface";
import {
  DriverApprovalStatus,
  Role,
} from "../../../generated/prisma/enums";
import { differenceInDays } from "date-fns";
import { IQuery } from "../../interface";
import { DriverWhereInput } from "../../../generated/prisma/models";

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

const applicationStatus = async (user: IRequestUser) => {
  const driver = await prisma.driver.findUnique({
    where: { userId: user.userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          profileUrl: true,
          role: true,
          status: true,
        },
      },
    },
  });
  if (!driver) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Driver application not found. Please apply first.",
    );
  }

  return driver;
};

const getAllApplications = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: DriverWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          licenseNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          nidNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          contactNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (query.email) {
    andConditions.push({
      user: {
        email: {
          contains: query.email,
          mode: "insensitive",
        },
      },
    });
  }

  // License number filter
  if (query.licenseNumber) {
    andConditions.push({
      licenseNumber: {
        equals: query.licenseNumber,
        mode: "insensitive",
      },
    });
  }

  andConditions.push({
    isDeleted: false,
    approvalStatus: DriverApprovalStatus.PENDING,
  });

  const applications = await prisma.driver.findMany({
    where: {
      AND: andConditions.length > 0 ? andConditions : undefined,
    },
    take: limit,
    skip: skip,
    orderBy: {
      // sortBy : sortOrder
      [sortBy]: sortOrder,
    },

    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  const totalApplicationCount = await prisma.driver.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: applications,
    meta: {
      page: page,
      limit: limit,
      total: totalApplicationCount,
      totalPages: Math.ceil(totalApplicationCount / limit),
    },
  };
};

const getApplicationById = async (id: string) => {
  const application = await prisma.driver.findUnique({
    where: {
      id,
      isDeleted: false,
      approvalStatus: DriverApprovalStatus.PENDING,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
  });

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver application not found.");
  }

  return application;
};

const getAllApprovedDriver = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";
  const andConditions: DriverWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          licenseNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          nidNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          contactNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (query.email) {
    andConditions.push({
      user: {
        email: {
          contains: query.email,
          mode: "insensitive",
        },
      },
    });
  }

  // License number filter
  if (query.licenseNumber) {
    andConditions.push({
      licenseNumber: {
        equals: query.licenseNumber,
        mode: "insensitive",
      },
    });
  }
  if (query.isAvailable !== undefined) {
    andConditions.push({
      isAvailable: query.isAvailable === "true" || query.isAvailable === true,
    });
  }

  andConditions.push({
    isDeleted: false,
    approvalStatus: DriverApprovalStatus.APPROVED,
  });

  const drivers = await prisma.driver.findMany({
    where: {
      AND: andConditions.length > 0 ? andConditions : undefined,
    },
    omit: {
      rejectionReason: true,
      rejectionNote: true,
      rejectedAt: true,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  const totalApplicationCount = await prisma.driver.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: drivers,
    meta: {
      page: page,
      limit: limit,
      total: totalApplicationCount,
      totalPages: Math.ceil(totalApplicationCount / limit),
    },
  };
};

const getApprovedDriverById = async (id: string) => {
  const driver = await prisma.driver.findUnique({
    where: {
      id,
      isDeleted: false,
      approvalStatus: DriverApprovalStatus.APPROVED,
    },
    omit: {
      rejectionReason: true,
      rejectionNote: true,
      rejectedAt: true,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
  });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  return driver;
};

const updateDutyStatus = async (userId: string, isAvailable: boolean) => {
  const driver = await prisma.driver.findUnique({
    where: {
      userId,
      isDeleted: false,
      approvalStatus: DriverApprovalStatus.APPROVED,
    },
  });

  if (!driver) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Approved driver profile not found.",
    );
  }

  if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
    const isPending = driver.approvalStatus === DriverApprovalStatus.PENDING;

    throw new AppError(
      httpStatus.FORBIDDEN,
      isPending
        ? "Your driver profile application is still under review (PENDING)."
        : `Your application was rejected. Reason: ${driver.rejectionReason || "N/A"}. Note: ${driver.rejectionNote || "N/A"}`,
    );
  }

  const updatedDriver = await prisma.driver.update({
    where: {
      userId,
    },
    data: {
      isAvailable,
    },
  });
  return updatedDriver;
};

export const DriverService = {
  applyAsDriver,
  approveDriver,
  applicationStatus,
  getAllApplications,
  getApplicationById,
  getAllApprovedDriver,
  getApprovedDriverById,
  updateDutyStatus,
};
