import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DriverController } from "./driver.controller";
import { DriverValidation } from "./driverValidation";

const router = Router();

router.post(
  "/apply-as-driver",
  auth(Role.CALLER),
  DriverController.applyAsDriver,
);

router.patch(
  "/approve-driver",
  auth(Role.ADMIN),
  DriverController.approveDriver,
);

router.get(
  "/application-status",
  auth(Role.CALLER),
  DriverController.applicationStatus,
);
// all pending application
router.get(
  "/applications",
  auth(Role.ADMIN),
  DriverController.getAllApplications,
);

router.get(
  "/applications/:id",
  auth(Role.ADMIN),
  DriverController.getApplicationById,
);

router.get(
  "/all-driver",
  auth(Role.ADMIN, Role.DISPATCHER),
  DriverController.getAllApprovedDriver,
);
router.get(
  "/all-driver/:id",
  auth(Role.ADMIN, Role.DISPATCHER),
  DriverController.getApprovedDriverById,
);
router.patch(
  "/me/status",
  auth(Role.DRIVER),
  validateRequest(DriverValidation.UpdateDutyStatusZodSchema),
  DriverController.updateDutyStatus,
);

export const DriverRoutes = router;
