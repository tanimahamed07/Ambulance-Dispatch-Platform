import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AnalyticsService } from "./analytics.service";

/**
 * Admin Dashboard Analytics Controller
 * GET /api/v1/analytics/admin
 */
const getAdminDashboard = catchAsync(async (req, res) => {
	const result = await AnalyticsService.getAdminDashboard();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin dashboard analytics retrieved successfully",
		data: result,
	});
});

/**
 * Dispatcher Dashboard Analytics Controller
 * GET /api/v1/analytics/dispatcher
 */
const getDispatcherDashboard = catchAsync(async (req, res) => {
	const result = await AnalyticsService.getDispatcherDashboard();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dispatcher dashboard analytics retrieved successfully",
		data: result,
	});
});

/**
 * Driver Dashboard Analytics Controller
 * GET /api/v1/analytics/driver
 */
const getDriverDashboard = catchAsync(async (req, res) => {
	const result = await AnalyticsService.getDriverDashboard(req.user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver dashboard analytics retrieved successfully",
		data: result,
	});
});

/**
 * Caller Dashboard Analytics Controller
 * GET /api/v1/analytics/caller
 */
const getCallerDashboard = catchAsync(async (req, res) => {
	const result = await AnalyticsService.getCallerDashboard(req.user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Caller dashboard analytics retrieved successfully",
		data: result,
	});
});

export const AnalyticsController = {
	getAdminDashboard,
	getDispatcherDashboard,
	getDriverDashboard,
	getCallerDashboard,
};
