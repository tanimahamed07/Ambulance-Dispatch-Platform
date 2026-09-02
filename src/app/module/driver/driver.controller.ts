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

export const DriverController = {
  applyAsDriver,
  approveDriver,
};
