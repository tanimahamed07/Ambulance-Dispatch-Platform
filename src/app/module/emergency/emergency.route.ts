import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { EmergencyController } from "./emergency.controller";
import { EmergencyValidation } from "./emergency.validation";

const router = Router();

router.post(
	"/",
	auth(Role.CALLER),
	validateRequest(EmergencyValidation.CreateEmergencyZodSchema),
	EmergencyController.createEmergency,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	EmergencyController.getAllEmergencies,
);

router.get(
	"/my-emergencies",
	auth(Role.CALLER),
	EmergencyController.getMyEmergencies,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER, Role.CALLER),
	EmergencyController.getEmergencyById,
);

router.patch(
	"/:id/priority",
	auth(Role.DISPATCHER),
	validateRequest(EmergencyValidation.UpdatePriorityZodSchema),
	EmergencyController.updateEmergencyPriority,
);

router.patch(
	"/:id/cancel",
	auth(Role.ADMIN, Role.DISPATCHER),
	validateRequest(EmergencyValidation.CancelEmergencyZodSchema),
	EmergencyController.cancelEmergency,
);

export const EmergencyRoutes = router;
