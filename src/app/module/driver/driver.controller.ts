import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DriverService } from "./driver.service";
import { IRequestUser } from "../auth/auth.interface";
import { DriverApprovalStatus } from "../../../generated/prisma/enums";

const applyAsDriver = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await DriverService.applyAsDriver(payload, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message:
      "Driver application submitted successfully. Please wait for admin approval.",
    data: result,
  });
});

const approveDriver = catchAsync(async (req, res) => {
  const payload = req.body;

  const result = await DriverService.approveDriver(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      req.body.approvalStatus === DriverApprovalStatus.APPROVED
        ? "Driver approved successfully."
        : "Driver rejected successfully.",
    data: result,
  });
});

const applicationStatus = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await DriverService.applicationStatus(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application status retrieved successfully.",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.getAllApplications(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver applications retrieved successfully.",
    data: result,
  });
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DriverService.getApplicationById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver application retrieved successfully.",
    data: result,
  });
});

const getAllApprovedDriver = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverService.getAllApprovedDriver(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver applications retrieved successfully.",
    data: result,
  });
});

const getApprovedDriverById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DriverService.getApprovedDriverById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Driver retrieved successfully.",
      data: result,
    });
  },
);

const updateDutyStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const payload = req.body;

  const result = await DriverService.updateDutyStatus(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Driver duty status updated to ${payload.isAvailable ? "AVAILABLE" : "OFF_DUTY"} successfully.`,
    data: result,
  });
});

export const DriverController = {
  applyAsDriver,
  approveDriver,
  applicationStatus,
  getAllApplications,
  getApplicationById,
  getAllApprovedDriver,
  getApprovedDriverById,
  updateDutyStatus,
};
