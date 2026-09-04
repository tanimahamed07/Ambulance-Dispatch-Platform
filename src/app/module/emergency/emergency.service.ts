import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateEmergencyPayload } from "./emergency.interface";
import {
  EmergencyType,
  Priority,
  EmergencyStatus,
} from "../../../generated/prisma/enums";
import { IQuery } from "../../interface";
import { EmergencyRequestWhereInput } from "../../../generated/prisma/models";

const createEmergency = async (payload: ICreateEmergencyPayload) => {
  let priority: Priority;

  if (
    payload.emergencyType === EmergencyType.CARDIAC ||
    payload.emergencyType === EmergencyType.STROKE
  ) {
    priority = Priority.CRITICAL;
  } else if (
    payload.emergencyType === EmergencyType.ACCIDENT ||
    payload.emergencyType === EmergencyType.TRAUMA ||
    payload.emergencyType === EmergencyType.BREATHING_PROBLEM
  ) {
    priority = Priority.HIGH;
  } else {
    priority = Priority.MEDIUM;
  }

  const emergency = await prisma.emergencyRequest.create({
    data: {
      ...payload,
      priority,
      status: EmergencyStatus.PENDING,
    },
  });

  return emergency;
};

const getAllEmergencies = async (query: any) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: any[] = [];

  // Search by patientName or patientPhone or pickupAddress
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          patientName: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          patientPhone: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          pickupAddress: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Emergency Type Filter (ACCIDENT, CARDIAC, etc.)
  if (query.emergencyType) {
    andConditions.push({
      emergencyType: query.emergencyType,
    });
  }

  // Status Filter (PENDING, ASSIGNED, COMPLETED, etc.)
  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  // Priority Filter (CRITICAL, HIGH, MEDIUM, LOW)
  if (query.priority) {
    andConditions.push({
      priority: query.priority,
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const emergencies = await prisma.emergencyRequest.findMany({
    where: whereConditions,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalEmergenciesCount = await prisma.emergencyRequest.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total: totalEmergenciesCount,
      totalPages: Math.ceil(totalEmergenciesCount / limit),
    },
    data: emergencies,
  };
};

export const EmergencyService = {
  createEmergency,
  getAllEmergencies,
};
