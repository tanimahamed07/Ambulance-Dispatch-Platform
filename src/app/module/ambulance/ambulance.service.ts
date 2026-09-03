import {
  ICreateAmbulancePayload,
  IUpdateAmbulancePayload,
} from "./ambulance.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  AmbulanceStatus,
  DriverApprovalStatus,
  DriverDutyStatus,
} from "../../../generated/prisma/enums";
import { IQuery } from "../../interface";
import { AmbulanceWhereInput } from "../../../generated/prisma/models";

const createAmbulance = async (payload: ICreateAmbulancePayload) => {
  const {
    ambulanceNumber,
    registrationNumber,
    registrationExpiry,
    vehicleType,
    model,
    capacity,
  } = payload;

  // Check if ambulance number already exists
  const existingAmbulanceByNumber = await prisma.ambulance.findUnique({
    where: { ambulanceNumber },
  });

  if (existingAmbulanceByNumber) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Ambulance with this ambulance number already exists",
    );
  }

  // Check if registration number already exists
  const existingAmbulanceByRegistration = await prisma.ambulance.findUnique({
    where: { registrationNumber },
  });

  if (existingAmbulanceByRegistration) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Ambulance with this registration number already exists",
    );
  }

  // Create new ambulance
  const ambulance = await prisma.ambulance.create({
    data: {
      ambulanceNumber,
      registrationNumber,
      registrationExpiry,
      vehicleType,
      model,
      capacity,
      status: AmbulanceStatus.AVAILABLE,
    },
  });

  return ambulance;
};

const getAllAmbulances = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: AmbulanceWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          ambulanceNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          registrationNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Vehicle type filter
  if (query.vehicleType) {
    andConditions.push({
      vehicleType: query.vehicleType,
    });
  }

  // Status filter
  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  // Soft deleted ambulance বাদ
  andConditions.push({
    isDeleted: false,
  });

  // AVAILABLE ambulance হলে অবশ্যই
  // approved + available driver assigned থাকতে হবে
  if (query.status === AmbulanceStatus.AVAILABLE) {
    andConditions.push({
      driver: {
        is: {
          approvalStatus: DriverApprovalStatus.APPROVED,
          dutyStatus: DriverDutyStatus.AVAILABLE,
          isDeleted: false,
        },
      },
    });
  }

  const ambulances = await prisma.ambulance.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      driver: {
        select: {
          id: true,
          contactNumber: true,
          approvalStatus: true,
          dutyStatus: true,
          currentLatitude: true,
          currentLongitude: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const totalAmbulancesCount = await prisma.ambulance.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: ambulances,

    meta: {
      page,
      limit,
      total: totalAmbulancesCount,
      totalPages: Math.ceil(totalAmbulancesCount / limit),
    },
  };
};

const getAvailableAmbulances = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: AmbulanceWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          ambulanceNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          registrationNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Vehicle type filter
  if (query.vehicleType) {
    andConditions.push({
      vehicleType: query.vehicleType,
    });
  }

  // Only available ambulances
  andConditions.push({
    status: AmbulanceStatus.AVAILABLE,
    isDeleted: false,
    // Must have an approved + available driver
    driver: {
      is: {
        approvalStatus: DriverApprovalStatus.APPROVED,
        dutyStatus: DriverDutyStatus.AVAILABLE,
        isDeleted: false,
      },
    },
  });

  const ambulances = await prisma.ambulance.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      driver: {
        select: {
          id: true,
          contactNumber: true,
          approvalStatus: true,
          dutyStatus: true,
          currentLatitude: true,
          currentLongitude: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const totalAmbulancesCount = await prisma.ambulance.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: ambulances,

    meta: {
      page,
      limit,
      total: totalAmbulancesCount,
      totalPages: Math.ceil(totalAmbulancesCount / limit),
    },
  };
};

const getAmbulanceById = async (id: string) => {
  const ambulance = await prisma.ambulance.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      driver: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  if (!ambulance) {
    throw new AppError(httpStatus.NOT_FOUND, "Ambulance not found");
  }

  return ambulance;
};

const updateAmbulance = async (
  id: string,
  payload: IUpdateAmbulancePayload,
) => {
  // Check if ambulance exists
  const existingAmbulance = await prisma.ambulance.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingAmbulance) {
    throw new AppError(httpStatus.NOT_FOUND, "Ambulance not found");
  }

  // Update ambulance
  const updatedAmbulance = await prisma.ambulance.update({
    where: { id },
    data: payload,
  });

  return updatedAmbulance;
};

const softDeleteAmbulance = async () => {};

const assignDriver = async () => {};

const unassignDriver = async () => {};

const updateMyAmbulanceStatus = async () => {};

const updateMyAmbulanceLocation = async () => {};

export const AmbulanceService = {
  createAmbulance,
  getAllAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  updateAmbulance,
  softDeleteAmbulance,
  assignDriver,
  unassignDriver,
  updateMyAmbulanceStatus,
  updateMyAmbulanceLocation,
};
