/** biome-ignore-all lint/suspicious/noNonNullAssertedOptionalChain: <explanation> */
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TripService } from "./trip.service";

const getAllTrips = catchAsync(async (req: Request, res: Response) => {
	const result = await TripService.getAllTrips(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Trips retrieved successfully",
		data: result,
	});
});

const getMyTrips = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId!;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.getMyTrips(driver.id, req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My trips retrieved successfully",
		data: result,
	});
});

const getTripById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await TripService.getTripById(id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Trip details retrieved successfully",
		data: result,
	});
});

const markEnRoute = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const userId = req.user?.userId!;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.markEnRoute(id as string, driver.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Trip marked as en route. Patient will be notified.",
		data: result,
	});
});

/**
 * Mark Patient as Picked Up
 */
const markPickedUp = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const userId = req.user?.userId!;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.markPickedUp(id as string, driver.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Patient marked as picked up. You can now select a hospital.",
		data: result,
	});
});

/**
 * Select Hospital
 */
const selectHospital = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.userId!;
	const payload = req.body;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.selectHospital(
		id as string,
		driver.id,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Hospital selected successfully. Proceed to hospital.",
		data: result,
	});
});

/**
 * Mark Hospital Arrival
 */
const markHospitalArrival = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.userId!;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.markHospitalArrival(id as string, driver.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message:
			"Arrived at hospital. Complete the trip after patient is admitted.",
		data: result,
	});
});

/**
 * Complete Trip
 */
const completeTrip = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.userId!;
	const payload = req.body;

	// Find driver by userId
	const driver = await prisma.driver.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	const result = await TripService.completeTrip(
		id as string,
		driver.id,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message:
			"Trip completed successfully. You are now available for new trips.",
		data: result,
	});
});

/**
 * Calculate Fare for a Trip
 * GET /trips/:id/calculate-fare?distanceKm=10.5
 */
const calculateFare = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const distanceKm = parseFloat(req.query.distanceKm as string);

	if (!distanceKm || Number.isNaN(distanceKm)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Distance (distanceKm) query parameter is required and must be a number",
		);
	}

	const result = await TripService.calculateTripFare(id as string, distanceKm);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Fare calculated successfully",
		data: result,
	});
});

/**
 * Cancel Trip - Admin/Dispatcher
 */
const cancelTrip = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await TripService.cancelTrip(id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message:
			"Trip cancelled successfully. All related statuses have been updated.",
		data: result,
	});
});

export const TripController = {
	getAllTrips,
	getMyTrips,
	getTripById,
	markEnRoute,
	markPickedUp,
	selectHospital,
	markHospitalArrival,
	completeTrip,
	calculateFare,
	cancelTrip,
};
