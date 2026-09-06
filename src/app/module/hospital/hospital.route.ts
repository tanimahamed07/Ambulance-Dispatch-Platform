import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { HospitalController } from "./hospital.controller";
import { HospitalValidation } from "./hospital.validation";

const router = Router();

// Admin: Create Hospital
router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(HospitalValidation.createHospitalValidation),
	HospitalController.createHospital,
);

// Admin, Dispatcher, Driver: Get All Hospitals
router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER),
	HospitalController.getAllHospitals,
);

// Get Hospital by ID
router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER, Role.CALLER),
	HospitalController.getHospitalById,
);

// Get Nearby Hospitals - Based on coordinates
router.get(
	"/nearby",
	auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER, Role.CALLER),
	HospitalController.getNearbyHospitals,
);

// // Admin: Update Hospital
router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(HospitalValidation.updateHospitalValidation),
	HospitalController.updateHospital,
);

// // Admin: Delete Hospital (Soft delete)
// router.delete("/:id", auth(Role.ADMIN), HospitalController.deleteHospital);

export const HospitalRoutes = router;
