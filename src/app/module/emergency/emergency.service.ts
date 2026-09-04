import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  ICreateEmergencyPayload,
  IUpdateEmergencyPriority,
  ICancelEmergency,
} from "./emergency.interface";
import {
  EmergencyType,
  Priority,
  EmergencyStatus,
} from "../../../generated/prisma/enums";
import { IQuery } from "../../interface";
import { EmergencyRequestWhereInput } from "../../../generated/prisma/models";

const createEmergency = async (
  callerId: string,
  payload: ICreateEmergencyPayload,
) => {
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
      callerId,
      status: EmergencyStatus.PENDING,
    },
    include: {
      caller: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return emergency;
};

const getAllEmergencies = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: EmergencyRequestWhereInput[] = [];

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
const getEmergencyById = async (id: string) => {
  const emergency = await prisma.emergencyRequest.findUnique({
    where: {
      id,
    },
    include: {
      caller: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!emergency) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency request not found");
  }

  return emergency;
};
const updateEmergencyPriority = async (
  id: string,
  payload: IUpdateEmergencyPriority,
) => {
  const emergency = await prisma.emergencyRequest.findUnique({
    where: {
      id,
    },
  });

  if (!emergency) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency request not found");
  }
  if (
    emergency.status === EmergencyStatus.HOSPITAL_COMPLETED ||
    emergency.status === EmergencyStatus.CANCELLED ||
    emergency.status === EmergencyStatus.PICKED
  ) {
    throw new Error(
      `Cannot change priority because the request status is ${emergency.status}`,
    );
  }

  const updatedEmergency = await prisma.emergencyRequest.update({
    where: {
      id,
    },
    data: {
      priority: payload.priority,
    },
  });

  return updatedEmergency;
};

const cancelEmergency = async (id: string, payload: ICancelEmergency) => {
  const emergency = await prisma.emergencyRequest.findUnique({
    where: {
      id,
    },
  });

  if (!emergency) {
    throw new AppError(httpStatus.NOT_FOUND, "Emergency request not found");
  }

  // Check if emergency is already cancelled
  if (emergency.status === EmergencyStatus.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency request is already cancelled",
    );
  }

  // Check if emergency is already completed
  if (emergency.status === EmergencyStatus.HOSPITAL_COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel a completed emergency request",
    );
  }

  if (
    emergency.status === EmergencyStatus.EN_ROUTE ||
    emergency.status === EmergencyStatus.PICKED ||
    emergency.status === EmergencyStatus.UP_AT
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel this request because the ambulance is active and status is ${emergency.status}`,
    );
  }

  // Update the emergency status to CANCELLED
  const cancelledEmergency = await prisma.emergencyRequest.update({
    where: { id },
    data: {
      status: EmergencyStatus.CANCELLED,
      cancellationReason: payload.cancellationReason || "No reason provided",
      cancelledAt: new Date(),
    },
  });

  return cancelledEmergency;
};

export const EmergencyService = {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergencyPriority,
  cancelEmergency,
};
