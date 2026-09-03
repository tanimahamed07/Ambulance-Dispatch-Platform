import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DriverController } from "./driver.controller";

const router = Router();

router.post(
  "/apply-as-driver",
  auth(Role.CALLER),
  DriverController.applyAsDriver,
);

router.patch(
  "/approve-doctor",
  auth(Role.ADMIN),
  DriverController.approveDriver,
);

router.get(
  "/application-status",
  auth(Role.CALLER),
  DriverController.applicationStatus,
);

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

export const DriverRoutes = router;
