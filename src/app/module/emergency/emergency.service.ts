import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateEmergencyPayload } from "./emergency.interface";
import {
  EmergencyType,
  Priority,
  EmergencyStatus,
} from "../../../generated/prisma/enums";

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

export const EmergencyService = {
  createEmergency,
};
