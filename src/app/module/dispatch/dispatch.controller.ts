import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DispatchService } from "./dispatch.service";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const createDispatch = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await DispatchService.createDispatch(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Dispatch created successfully. Driver has been notified.",
    data: result,
  });
});
const getAllDispatches = catchAsync(async (req: Request, res: Response) => {
  const result = await DispatchService.getAllDispatches(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatches retrieved successfully.",
    data: result,
  });
});

const getMyDispatches = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  // First find driver by userId
  const driver = await prisma.driver.findUnique({
    where: { userId },
  });

  if (!driver) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, "Driver profile not found");
  }

  const result = await DispatchService.getMyDispatches(driver.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My dispatches retrieved successfully.",
    data: result,
  });
});

const getDispatchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DispatchService.getDispatchById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatch retrieved successfully.",
    data: result,
  });
});

const acceptDispatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DispatchService.getDispatchById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatch accept successfully.",
    data: result,
  });
});

const rejectDispatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const driverId = req.user?.userId!;

  // First find driver by userId
  const driver = await prisma.driver.findUnique({
    where: { userId: driverId },
  });

  if (!driver) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Driver profile not found",
      data: null,
    });
  }

  const result = await DispatchService.rejectDispatch(id as string, driver.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatch rejected. The dispatcher will reassign another driver.",
    data: result,
  });
});

export const DispatchController = {
  createDispatch,
  getAllDispatches,
  getDispatchById,
  getMyDispatches,
  acceptDispatch,
  rejectDispatch,
};
