import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

/**
 * Admin Dashboard Overview Route
 * GET /api/v1/analytics/admin
 * Access: ADMIN only
 */
router.get("/admin", auth(Role.ADMIN), AnalyticsController.getAdminDashboard);

/**
 * Dispatcher Dashboard Overview Route
 * GET /api/v1/analytics/dispatcher
 * Access: DISPATCHER only
 */
router.get(
	"/dispatcher",
	auth(Role.DISPATCHER),
	AnalyticsController.getDispatcherDashboard,
);

/**
 * Driver Dashboard Overview Route
 * GET /api/v1/analytics/driver
 * Access: DRIVER only
 */
router.get("/driver", auth(Role.DRIVER), AnalyticsController.getDriverDashboard);

/**
 * Caller Dashboard Overview Route
 * GET /api/v1/analytics/caller
 * Access: CALLER only
 */
router.get("/caller", auth(Role.CALLER), AnalyticsController.getCallerDashboard);

export const AnalyticsRoutes = router;
