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

const getAllAmbulances = catchAsync(async (req: Request, res: Response) => {
  const result = await AmbulanceService.getAllAmbulances(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All ambulances retrieved successfully.",
    data: result,
  });
});

const getAvailableAmbulances = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AmbulanceService.getAvailableAmbulances(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Available Ambulances retrieved successfully.",
      data: result,
    });
  },
);

const getAmbulanceById = catchAsync(async (req: Request, res: Response) => {
  const ambulanceId = req.params.id as string;
  const result = await AmbulanceService.getAmbulanceById(ambulanceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ambulance retrieved successfully.",
    data: result,
  });
});

const updateAmbulance = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.body;

  const result = await AmbulanceService.updateAmbulance(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ambulance updated successfully.",
    data: result,
  });
});

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
