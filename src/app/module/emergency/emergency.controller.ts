import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmergencyService } from "./emergency.service";

const createEmergency = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await EmergencyService.createEmergency(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Emergency request created successfully.",
    data: result,
  });
});

export const EmergencyController = {
  createEmergency,
};
