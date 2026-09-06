import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AmbulanceController } from "./ambulance.controller";
import { AmbulanceValidation } from "./ambulance.validation";

const router = Router();

// Admin — fleet management
router.post(
  "/create-ambulance",
  auth(Role.ADMIN),
  validateRequest(AmbulanceValidation.CreateAmbulanceZodSchema),
  AmbulanceController.createAmbulance,
);

router.get(
  "/all-ambulance",
  auth(Role.ADMIN, Role.DISPATCHER),
  AmbulanceController.getAllAmbulances,
);

router.get(
  "/available",
  auth(Role.DISPATCHER),
  AmbulanceController.getAvailableAmbulances,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.DISPATCHER),
  AmbulanceController.getAmbulanceById,
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(AmbulanceValidation.UpdateAmbulanceZodSchema),
  AmbulanceController.updateAmbulance,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  AmbulanceController.softDeleteAmbulance,
);

// Admin — assign/unassign driver
router.patch(
  "/:id/assign-driver",
  auth(Role.ADMIN),
  AmbulanceController.assignDriver,
);

router.patch(
  "/:id/unassign-driver",
  auth(Role.ADMIN),
  AmbulanceController.unassignDriver,
);

// Driver — status + location (syncs to assigned ambulance)


router.patch(
  "/me/location",
  auth(Role.DRIVER),
  validateRequest(AmbulanceValidation.UpdateLocationZodSchema),
  AmbulanceController.updateMyAmbulanceLocation,
);

export const AmbulanceRoutes = router;
