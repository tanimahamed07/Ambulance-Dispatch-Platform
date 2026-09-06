import httpStatus from "http-status";
import {
	AmbulanceStatus,
	DispatchStatus,
	EmergencyStatus,
	TripStatus,
} from "../../../generated/prisma/enums";
import type { TripWhereInput } from "../../../generated/prisma/models";
import type { IQuery } from "../../interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { calculateFare } from "../../utils/fareCalculator";
import type { ICompleteTrip, ISelectHospital } from "./trip.interface";

/**
 * Get All Trips - For Admin & Dispatcher
 * Includes comprehensive filtering, search, and pagination
 */
const getAllTrips = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const andConditions: TripWhereInput[] = [];

	// Search by patient name, driver name, ambulance number, phone
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					emergency: {
						patientName: {
							contains: query.searchTerm,
							mode: "insensitive",
						},
					},
				},
				{
					emergency: {
						patientPhone: {
							contains: query.searchTerm,
							mode: "insensitive",
						},
					},
				},
				{
					dispatch: {
						driver: {
							user: {
								name: {
									contains: query.searchTerm,
									mode: "insensitive",
								},
							},
						},
					},
				},
				{
					dispatch: {
						ambulance: {
							ambulanceNumber: {
								contains: query.searchTerm,
								mode: "insensitive",
							},
						},
					},
				},
			],
		});
	}

	// Trip Status filter
	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}

	// Emergency Type filter
	if (query.emergencyType) {
		andConditions.push({
			emergency: {
				emergencyType: query.emergencyType,
			},
		});
	}

	// Priority filter
	if (query.priority) {
		andConditions.push({
			emergency: {
				priority: query.priority,
			},
		});
	}

	// Driver filter
	if (query.driverId) {
		andConditions.push({
			dispatch: {
				driverId: query.driverId,
			},
		});
	}

	// Hospital filter
	if (query.hospitalId) {
		andConditions.push({
			hospitalId: query.hospitalId,
		});
	}

	const whereConditions =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const trips = await prisma.trip.findMany({
		where: whereConditions,
		take: limit,
		skip: skip,
		orderBy: {
			[sortBy]: sortOrder,
		},
		select: {
			id: true,
			status: true,
			startedAt: true,
			pickedUpAt: true,
			hospitalArrivalAt: true,
			completedAt: true,
			distanceKm: true,
			fare: true,
			createdAt: true,
			emergency: {
				select: {
					id: true,
					patientName: true,
					patientPhone: true,
					emergencyType: true,
					priority: true,
					status: true,
					pickupAddress: true,
					pickupLatitude: true,
					pickupLongitude: true,
				},
			},
			dispatch: {
				select: {
					id: true,
					status: true,
					dispatchedAt: true,
					acceptedAt: true,
					driver: {
						select: {
							id: true,
							user: {
								select: {
									name: true,
									email: true,
									profileUrl: true,
								},
							},
						},
					},
					ambulance: {
						select: {
							id: true,
							ambulanceNumber: true,
							vehicleType: true,
							status: true,
							currentLatitude: true,
							currentLongitude: true,
						},
					},
				},
			},
			hospital: {
				select: {
					id: true,
					name: true,
					address: true,
					latitude: true,
					longitude: true,
				},
			},
		},
	});

	const totalTripsCount = await prisma.trip.count({
		where: whereConditions,
	});

	return {
		meta: {
			page,
			limit,
			total: totalTripsCount,
			totalPages: Math.ceil(totalTripsCount / limit),
		},
		data: trips,
	};
};

/**
 * Get My Trips - For Driver
 * Shows all trips assigned to the logged-in driver
 */
const getMyTrips = async (driverId: string, query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";

	const andConditions: TripWhereInput[] = [
		{
			dispatch: {
				driverId: driverId,
			},
		},
	];

	// Status filter
	if (query.status) {
		andConditions.push({
			status: query.status,
		});
	}

	// Emergency Type filter
	if (query.emergencyType) {
		andConditions.push({
			emergency: {
				emergencyType: query.emergencyType,
			},
		});
	}

	// Search by patient name or phone
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					emergency: {
						patientName: {
							contains: query.searchTerm,
							mode: "insensitive",
						},
					},
				},
				{
					emergency: {
						patientPhone: {
							contains: query.searchTerm,
							mode: "insensitive",
						},
					},
				},
			],
		});
	}

	const whereConditions =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const trips = await prisma.trip.findMany({
		where: whereConditions,
		take: limit,
		skip: skip,
		orderBy: {
			[sortBy]: sortOrder,
		},
		select: {
			id: true,
			status: true,
			startedAt: true,
			pickedUpAt: true,
			hospitalArrivalAt: true,
			completedAt: true,
			distanceKm: true,
			fare: true,
			createdAt: true,
			emergency: {
				select: {
					id: true,
					patientName: true,
					patientPhone: true,
					emergencyType: true,
					priority: true,
					status: true,
					pickupAddress: true,
					pickupLatitude: true,
					pickupLongitude: true,
					description: true,
				},
			},
			dispatch: {
				select: {
					id: true,
					dispatchedAt: true,
					acceptedAt: true,
					ambulance: {
						select: {
							id: true,
							ambulanceNumber: true,
							vehicleType: true,
						},
					},
				},
			},
			hospital: {
				select: {
					id: true,
					name: true,
					address: true,
					latitude: true,
					longitude: true,
				},
			},
		},
	});

	const totalTripsCount = await prisma.trip.count({
		where: whereConditions,
	});

	return {
		meta: {
			page,
			limit,
			total: totalTripsCount,
			totalPages: Math.ceil(totalTripsCount / limit),
		},
		data: trips,
	};
};

// Full details for a single trip

const getTripById = async (tripId: string) => {
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		include: {
			emergency: {
				include: {
					caller: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									profileUrl: true,
								},
							},
						},
					},
				},
			},
			dispatch: {
				include: {
					driver: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									profileUrl: true,
								},
							},
						},
					},
					ambulance: true,
				},
			},
			hospital: true,
		},
	});

	if (!trip) {
		throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
	}

	return trip;
};

//   Driver starts moving towards pickup location

const markEnRoute = async (tripId: string, driverId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip and verify ownership
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Verify it's the assigned driver
		if (trip.dispatch.driverId !== driverId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not authorized to update this trip",
			);
		}

		// 3. Check current status
		if (trip.status !== TripStatus.DISPATCHED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Cannot mark as en route. Current trip status is ${trip.status}`,
			);
		}

		// 4. Update trip status
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: TripStatus.EN_ROUTE,
				startedAt: new Date(),
			},
		});

		// 5. Update emergency status
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.EN_ROUTE,
			},
		});

		// 6. Ambulance already EN_ROUTE from acceptDispatch, so no change needed

		return updatedTrip;
	});

	return result;
};

//  Driver has reached and picked up the patient

const markPickedUp = async (tripId: string, driverId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip and verify ownership
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Verify it's the assigned driver
		if (trip.dispatch.driverId !== driverId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not authorized to update this trip",
			);
		}

		// 3. Check current status
		if (trip.status !== TripStatus.EN_ROUTE) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Cannot mark as picked up. Current trip status is ${trip.status}. Trip must be EN_ROUTE first.`,
			);
		}

		// 4. Update trip status
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: TripStatus.PICKED_UP,
				pickedUpAt: new Date(),
			},
		});

		// 5. Update emergency status
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.PICKED_UP,
			},
		});

		// 6. Update ambulance status
		await tx.ambulance.update({
			where: { id: trip.dispatch.ambulanceId },
			data: {
				status: AmbulanceStatus.ON_TRIP,
			},
		});

		return updatedTrip;
	});

	return result;
};

/**
 * Select Hospital
 * Driver selects destination hospital after patient pickup
 */
const selectHospital = async (
	tripId: string,
	driverId: string,
	payload: ISelectHospital,
) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip and verify ownership
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Verify it's the assigned driver
		if (trip.dispatch.driverId !== driverId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not authorized to update this trip",
			);
		}

		// 3. Check if patient is picked up
		if (trip.status !== TripStatus.PICKED_UP) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Cannot select hospital. Patient must be picked up first. Current status: ${trip.status}`,
			);
		}

		// 4. Check if hospital already selected
		if (trip.hospitalId) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Hospital already selected for this trip",
			);
		}

		// 5. Verify hospital exists
		const hospital = await tx.hospital.findUnique({
			where: { id: payload.hospitalId },
		});

		if (!hospital) {
			throw new AppError(httpStatus.NOT_FOUND, "Hospital not found");
		}

		// 6. Update trip with hospital
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				hospitalId: payload.hospitalId,
			},
		});

		// 7. Update emergency status
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.PICKED_UP,
			},
		});

		return updatedTrip;
	});

	return result;
};

/**
 * Mark Hospital Arrival
 * Driver has reached the hospital
 */
const markHospitalArrival = async (tripId: string, driverId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip and verify ownership
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Verify it's the assigned driver
		if (trip.dispatch.driverId !== driverId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not authorized to update this trip",
			);
		}

		// 3. Check if hospital is selected
		if (!trip.hospitalId) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Cannot mark hospital arrival. Hospital must be selected first.",
			);
		}

		// 4. Check current status
		if (trip.status !== TripStatus.PICKED_UP) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Cannot mark hospital arrival. Current trip status is ${trip.status}`,
			);
		}

		// 5. Update trip status
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: TripStatus.AT_HOSPITAL,
				hospitalArrivalAt: new Date(),
			},
		});

		// 6. Update emergency status to AT_HOSPITAL
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.AT_HOSPITAL,
			},
		});

		return updatedTrip;
	});

	return result;
};

/**
 * Complete Trip
 * Driver completes the trip after patient is admitted to hospital
 * Calculates fare automatically based on distance and priority
 */
const completeTrip = async (
	tripId: string,
	driverId: string,
	payload: ICompleteTrip,
) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip and verify ownership (include emergency to get priority)
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
				emergency: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Verify it's the assigned driver
		if (trip.dispatch.driverId !== driverId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You are not authorized to update this trip",
			);
		}

		// 3. Check current status
		if (trip.status !== TripStatus.AT_HOSPITAL) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Cannot complete trip. Current trip status is ${trip.status}. Must arrive at hospital first.`,
			);
		}

		// 4. Validate distance
		if (payload.distanceKm < 0.1 || payload.distanceKm > 500) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Invalid distance. Must be between 0.1 and 500 km",
			);
		}

		// 5. Calculate fare based on distance and priority
		const calculatedFare = calculateFare(
			payload.distanceKm,
			trip.emergency.priority,
		);

		// 6. Update trip status using backend-calculated fare
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: TripStatus.COMPLETED,
				distanceKm: payload.distanceKm,
				fare: calculatedFare,
				completedAt: new Date(),
			},
		});

		// 7. Update emergency status to COMPLETED
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.COMPLETED,
			},
		});

		// 8. Update ambulance status to AVAILABLE
		await tx.ambulance.update({
			where: { id: trip.dispatch.ambulanceId },
			data: {
				status: AmbulanceStatus.AVAILABLE,
			},
		});

		// 9. Update dispatch status to COMPLETED
		await tx.dispatch.update({
			where: { id: trip.dispatchId },
			data: {
				status: DispatchStatus.COMPLETED,
			},
		});

		// 10. Mark driver as available again
		await tx.driver.update({
			where: { id: trip.dispatch.driverId },
			data: {
				isAvailable: true,
			},
		});

		return updatedTrip;
	});

	return result;
};

/**
 * Calculate Fare for Trip
 * Returns calculated fare based on distance and priority
 * Used by frontend before completing the trip
 */
const calculateTripFare = async (tripId: string, distanceKm: number) => {
	// Validate distance
	if (distanceKm < 0.1 || distanceKm > 500) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Invalid distance. Must be between 0.1 and 500 km",
		);
	}

	// Find trip to get emergency priority
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		include: {
			emergency: {
				select: {
					priority: true,
				},
			},
		},
	});

	if (!trip) {
		throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
	}

	// Calculate fare
	const fare = calculateFare(distanceKm, trip.emergency.priority);

	return {
		distanceKm,
		priority: trip.emergency.priority,
		baseFare: 200,
		perKmRate:
			trip.emergency.priority === "CRITICAL"
				? 100
				: trip.emergency.priority === "HIGH"
					? 80
					: trip.emergency.priority === "MEDIUM"
						? 60
						: 50,
		calculatedFare: fare,
	};
};

/**
 * Cancel Trip
 * Admin/Dispatcher cancels a trip (emergency cancellation)
 */
const cancelTrip = async (tripId: string) => {
	const result = await prisma.$transaction(async (tx) => {
		// 1. Find trip
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: {
				dispatch: true,
			},
		});

		if (!trip) {
			throw new AppError(httpStatus.NOT_FOUND, "Trip not found");
		}

		// 2. Check if already completed or cancelled
		if (trip.status === TripStatus.COMPLETED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Cannot cancel a completed trip",
			);
		}

		if (trip.status === TripStatus.CANCELLED) {
			throw new AppError(httpStatus.BAD_REQUEST, "Trip is already cancelled");
		}

		// 3. Update trip status
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: TripStatus.CANCELLED,
			},
		});

		// 4. Update emergency status
		await tx.emergencyRequest.update({
			where: { id: trip.emergencyId },
			data: {
				status: EmergencyStatus.CANCELLED,
			},
		});

		// 5. Update ambulance status to AVAILABLE
		await tx.ambulance.update({
			where: { id: trip.dispatch.ambulanceId },
			data: {
				status: AmbulanceStatus.AVAILABLE,
			},
		});

		// 6. Update dispatch status to CANCELLED
		await tx.dispatch.update({
			where: { id: trip.dispatchId },
			data: {
				status: DispatchStatus.CANCELLED,
			},
		});

		// 7. Mark driver as available again
		await tx.driver.update({
			where: { id: trip.dispatch.driverId },
			data: {
				isAvailable: true,
			},
		});

		return updatedTrip;
	});

	return result;
};

export const TripService = {
	getAllTrips,
	getMyTrips,
	getTripById,
	markEnRoute,
	markPickedUp,
	selectHospital,
	markHospitalArrival,
	completeTrip,
	calculateTripFare,
	cancelTrip,
};
