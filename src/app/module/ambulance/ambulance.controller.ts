import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AmbulanceService } from "./ambulance.service";

const createAmbulance = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AmbulanceService.createAmbulance(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Ambulance created successfully.",
    data: result,
  });
});

const getAllAmbulances = catchAsync(async (req: Request, res: Response) => {});

const getAvailableAmbulances = catchAsync(
  async (req: Request, res: Response) => {},
);

const getAmbulanceById = catchAsync(async (req: Request, res: Response) => {});

const updateAmbulance = catchAsync(async (req: Request, res: Response) => {});

const softDeleteAmbulance = catchAsync(
  async (req: Request, res: Response) => {},
);

const assignDriver = catchAsync(async (req: Request, res: Response) => {});

const unassignDriver = catchAsync(async (req: Request, res: Response) => {});

const updateMyAmbulanceStatus = catchAsync(
  async (req: Request, res: Response) => {},
);

const updateMyAmbulanceLocation = catchAsync(
  async (req: Request, res: Response) => {},
);

export const AmbulanceController = {
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
