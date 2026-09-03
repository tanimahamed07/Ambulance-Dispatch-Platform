import { ICreateAmbulancePayload } from "./ambulance.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { AmbulanceStatus } from "../../../generated/prisma/enums";

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

const getAllAmbulances = async () => {};

const getAvailableAmbulances = async () => {};

const getAmbulanceById = async () => {};

const updateAmbulance = async () => {};

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
