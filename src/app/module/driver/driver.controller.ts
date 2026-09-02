import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DriverService } from "./driver.service";

const applyAsDoctor = catchAsync(async (req: Request, res: Response) => {
 

  const result = await DriverService.applyAsDoctor({});
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "profileImage Uploaded successfully",
    data: result,
  });
});

export const DriverController = {
  applyAsDoctor,
};
