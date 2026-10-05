import httpStatus from "http-status";
import {
	AmbulanceStatus,
	DispatchStatus,
	DriverApprovalStatus,
	EmergencyStatus,
	PaymentStatus,
	TripStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IRequestUser } from "../auth/auth.interface";

/**
 * Admin Dashboard Overview Analytics
 * Simple counts and stats for admin overview page
 */
const getAdminDashboard = async () => {
	// Total users count
	const totalUsers = await prisma.user.count({
		where: { isDeleted: false },
	});

	const totalAdmins = await prisma.user.count({
		where: { role: "ADMIN", isDeleted: false },
	});

	const totalDispatchers = await prisma.user.count({
		where: { role: "DISPATCHER", isDeleted: false },
	});

	const totalDrivers = await prisma.user.count({
		where: { role: "DRIVER", isDeleted: false },
	});

	const totalCallers = await prisma.user.count({
		where: { role: "CALLER", isDeleted: false },
	});

	// Emergency stats
	const totalEmergencies = await prisma.emergencyRequest.count();

	const pendingEmergencies = await prisma.emergencyRequest.count({
		where: { status: EmergencyStatus.PENDING },
	});

	const completedEmergencies = await prisma.emergencyRequest.count({
		where: { status: EmergencyStatus.COMPLETED },
	});

	// Ambulance stats
	const totalAmbulances = await prisma.ambulance.count({
		where: { isDeleted: false },
	});

	const availableAmbulances = await prisma.ambulance.count({
		where: { status: AmbulanceStatus.AVAILABLE, isDeleted: false },
	});

	const onTripAmbulances = await prisma.ambulance.count({
		where: { status: AmbulanceStatus.ON_TRIP, isDeleted: false },
	});

	// Driver approval stats
	const approvedDrivers = await prisma.driver.count({
		where: { approvalStatus: DriverApprovalStatus.APPROVED, isDeleted: false },
	});

	const pendingDriverApplications = await prisma.driver.count({
		where: { approvalStatus: DriverApprovalStatus.PENDING, isDeleted: false },
	});

	// Revenue stats
	const revenueData = await prisma.payment.aggregate({
		where: { status: PaymentStatus.COMPLETED },
		_sum: { amount: true },
		_count: true,
	});

	const totalRevenue = revenueData._sum.amount || 0;
	const totalCompletedPayments = revenueData._count || 0;

	return {
		users: {
			total: totalUsers,
			admins: totalAdmins,
			dispatchers: totalDispatchers,
			drivers: totalDrivers,
			callers: totalCallers,
		},
		emergencies: {
			total: totalEmergencies,
			pending: pendingEmergencies,
			completed: completedEmergencies,
		},
		ambulances: {
			total: totalAmbulances,
			available: availableAmbulances,
			onTrip: onTripAmbulances,
		},
		drivers: {
			approved: approvedDrivers,
			pendingApplications: pendingDriverApplications,
		},
		revenue: {
			total: totalRevenue,
			completedPayments: totalCompletedPayments,
		},
	};
};

/**
 * Dispatcher Dashboard Overview Analytics
 * Stats for dispatcher to manage emergencies and dispatches
 */
const getDispatcherDashboard = async () => {
	// Emergency counts
	const totalEmergencies = await prisma.emergencyRequest.count();

	const pendingEmergencies = await prisma.emergencyRequest.count({
		where: { status: EmergencyStatus.PENDING },
	});

	const assignedEmergencies = await prisma.emergencyRequest.count({
		where: { status: EmergencyStatus.ASSIGNED },
	});

	const completedEmergencies = await prisma.emergencyRequest.count({
		where: { status: EmergencyStatus.COMPLETED },
	});

	// Dispatch counts
	const totalDispatches = await prisma.dispatch.count();

	const pendingDispatches = await prisma.dispatch.count({
		where: { status: DispatchStatus.PENDING },
	});

	const acceptedDispatches = await prisma.dispatch.count({
		where: { status: DispatchStatus.ACCEPTED },
	});

	const completedDispatches = await prisma.dispatch.count({
		where: { status: DispatchStatus.COMPLETED },
	});

	// Available resources
	const availableAmbulances = await prisma.ambulance.count({
		where: { status: AmbulanceStatus.AVAILABLE, isDeleted: false },
	});

	const availableDrivers = await prisma.driver.count({
		where: {
			approvalStatus: DriverApprovalStatus.APPROVED,
			isAvailable: true,
			isDeleted: false,
		},
	});

	// Dispatchable drivers (drivers ready to be assigned)
	const dispatchableDrivers = await prisma.driver.count({
		where: {
			approvalStatus: DriverApprovalStatus.APPROVED,
			isAvailable: true,
			ambulanceId: { not: null },
			isDeleted: false,
			ambulance: {
				is: {
					status: AmbulanceStatus.AVAILABLE,
					isDeleted: false,
				},
			},
			dispatches: {
				none: {
					status: {
						in: [DispatchStatus.PENDING, DispatchStatus.ACCEPTED],
					},
				},
			},
		},
	});

	return {
		emergencies: {
			total: totalEmergencies,
			pending: pendingEmergencies,
			assigned: assignedEmergencies,
			completed: completedEmergencies,
		},
		dispatches: {
			total: totalDispatches,
			pending: pendingDispatches,
			accepted: acceptedDispatches,
			completed: completedDispatches,
		},
		resources: {
			availableAmbulances,
			availableDrivers,
			dispatchableDrivers,
		},
	};
};

/**
 * Driver Dashboard Overview Analytics
 * Personal stats for driver's own overview page
 */
const getDriverDashboard = async (user: IRequestUser) => {
	// Get driver profile
	const driver = await prisma.driver.findUnique({
		where: { userId: user.userId },
		include: {
			ambulance: {
				select: {
					id: true,
					ambulanceNumber: true,
					status: true,
					vehicleType: true,
				},
			},
		},
	});

	if (!driver) {
		throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
	}

	// Dispatch stats
	const totalDispatches = await prisma.dispatch.count({
		where: { driverId: driver.id },
	});

	const pendingDispatches = await prisma.dispatch.count({
		where: {
			driverId: driver.id,
			status: DispatchStatus.PENDING,
		},
	});

	const acceptedDispatches = await prisma.dispatch.count({
		where: {
			driverId: driver.id,
			status: DispatchStatus.ACCEPTED,
		},
	});

	const completedDispatches = await prisma.dispatch.count({
		where: {
			driverId: driver.id,
			status: DispatchStatus.COMPLETED,
		},
	});

	// Trip stats
	const totalTrips = await prisma.trip.count({
		where: { dispatch: { driverId: driver.id } },
	});

	const completedTrips = await prisma.trip.count({
		where: {
			dispatch: { driverId: driver.id },
			status: TripStatus.COMPLETED,
		},
	});

	// Earnings calculation
	const earningsData = await prisma.payment.aggregate({
		where: {
			trip: {
				dispatch: { driverId: driver.id },
				status: TripStatus.COMPLETED,
			},
			status: PaymentStatus.COMPLETED,
		},
		_sum: { amount: true },
		_count: true,
	});

	const totalEarnings = earningsData._sum.amount || 0;
	const completedPayments = earningsData._count || 0;

	return {
		profile: {
			driverId: driver.id,
			approvalStatus: driver.approvalStatus,
			isAvailable: driver.isAvailable,
			hasAmbulance: !!driver.ambulanceId,
			ambulance: driver.ambulance || null,
		},
		dispatches: {
			total: totalDispatches,
			pending: pendingDispatches,
			accepted: acceptedDispatches,
			completed: completedDispatches,
		},
		trips: {
			total: totalTrips,
			completed: completedTrips,
		},
		earnings: {
			total: totalEarnings,
			completedPayments,
		},
	};
};

/**
 * Caller Dashboard Overview Analytics
 * Personal stats for caller's own overview page
 */
const getCallerDashboard = async (user: IRequestUser) => {
	// Get caller profile
	const caller = await prisma.caller.findUnique({
		where: { userId: user.userId },
	});

	if (!caller) {
		throw new AppError(httpStatus.NOT_FOUND, "Caller profile not found");
	}

	// Emergency stats
	const totalEmergencies = await prisma.emergencyRequest.count({
		where: { callerId: caller.id },
	});

	const pendingEmergencies = await prisma.emergencyRequest.count({
		where: {
			callerId: caller.id,
			status: EmergencyStatus.PENDING,
		},
	});

	const completedEmergencies = await prisma.emergencyRequest.count({
		where: {
			callerId: caller.id,
			status: EmergencyStatus.COMPLETED,
		},
	});

	const cancelledEmergencies = await prisma.emergencyRequest.count({
		where: {
			callerId: caller.id,
			status: EmergencyStatus.CANCELLED,
		},
	});

	// Trip stats
	const totalTrips = await prisma.trip.count({
		where: { emergency: { callerId: caller.id } },
	});

	const completedTrips = await prisma.trip.count({
		where: {
			emergency: { callerId: caller.id },
			status: TripStatus.COMPLETED,
		},
	});

	// Payment & spending stats
	const spendingData = await prisma.payment.aggregate({
		where: {
			trip: { emergency: { callerId: caller.id } },
			status: PaymentStatus.COMPLETED,
		},
		_sum: { amount: true },
		_count: true,
	});

	const totalSpending = spendingData._sum.amount || 0;
	const completedPayments = spendingData._count || 0;

	const pendingPayments = await prisma.payment.count({
		where: {
			trip: { emergency: { callerId: caller.id } },
			status: PaymentStatus.PENDING,
		},
	});

	return {
		emergencies: {
			total: totalEmergencies,
			pending: pendingEmergencies,
			completed: completedEmergencies,
			cancelled: cancelledEmergencies,
		},
		trips: {
			total: totalTrips,
			completed: completedTrips,
		},
		payments: {
			totalSpending,
			completedPayments,
			pendingPayments,
		},
	};
};

export const AnalyticsService = {
	getAdminDashboard,
	getDispatcherDashboard,
	getDriverDashboard,
	getCallerDashboard,
};
