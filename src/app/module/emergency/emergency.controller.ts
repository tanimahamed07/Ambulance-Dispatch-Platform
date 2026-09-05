import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmergencyService } from "./emergency.service";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const createEmergency = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId!;

  const caller = await prisma.caller.findUnique({
    where: { userId: userId },
  });

  if (!caller) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Caller profile not found. Please complete your profile first.",
      data: null,
    });
  }

  const result = await EmergencyService.createEmergency(caller.id, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Emergency request created successfully.",
    data: result,
  });
});

const getAllEmergencies = catchAsync(async (req: Request, res: Response) => {
  const result = await EmergencyService.getAllEmergencies(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Emergencies retrieved successfully.",
    data: result,
  });
});

const getMyEmergencies = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  const caller = await prisma.caller.findUnique({
    where: { userId },
  });

  if (!caller) {
    throw new AppError(httpStatus.NOT_FOUND, "Caller profile not found.");
  }

  const result = await EmergencyService.getMyEmergencies(caller.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My emergencies retrieved successfully.",
    data: result,
  });
});
const getMyEmergencyById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await EmergencyService.getMyEmergencyById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Emergency retrieved successfully.",
    data: result,
  });
});

const getEmergencyById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await EmergencyService.getEmergencyById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Emergency retrieved successfully.",
    data: result,
  });
});
const updateEmergencyPriority = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await EmergencyService.updateEmergencyPriority(
      id as string,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Emergency priority updated successfully.",
      data: result,
    });
  },
);

const cancelEmergency = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await EmergencyService.cancelEmergency(id as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Emergency request cancelled successfully.",
    data: result,
  });
});

export const EmergencyController = {
  createEmergency,
  getAllEmergencies,
  getMyEmergencies,
  getEmergencyById,
  updateEmergencyPriority,
  cancelEmergency,
  getMyEmergencyById,
};
