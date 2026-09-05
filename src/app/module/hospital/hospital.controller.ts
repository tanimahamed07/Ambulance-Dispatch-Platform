import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { HospitalService } from "./hospital.service";

const createHospital = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await HospitalService.createHospital(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Hospital created successfully.",
    data: result,
  });
});

const getAllHospitals = catchAsync(async (req: Request, res: Response) => {
  const result = await HospitalService.getAllHospitals(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hospitals retrieved successfully.",
    data: result,
  });
});

// const getHospitalById = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await HospitalService.getHospitalById(id);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Hospital retrieved successfully.",
//     data: result,
//   });
// });

// const updateHospital = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const payload = req.body;
//   const result = await HospitalService.updateHospital(id, payload);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Hospital updated successfully.",
//     data: result,
//   });
// });

// const deleteHospital = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await HospitalService.deleteHospital(id);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Hospital deleted successfully.",
//     data: result,
//   });
// });

// const getNearbyHospitals = catchAsync(async (req: Request, res: Response) => {
//   const { latitude, longitude, radius } = req.query;

//   const result = await HospitalService.getNearbyHospitals(
//     Number(latitude),
//     Number(longitude),
//     radius ? Number(radius) : undefined,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Nearby hospitals retrieved successfully.",
//     data: result,
//   });
// });

export const HospitalController = {
  createHospital,
  getAllHospitals,
//   getHospitalById,
//   updateHospital,
//   deleteHospital,
//   getNearbyHospitals,
};
