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
  "/:id",
  auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER),
  EmergencyController.getEmergencyById,
);


router.patch(
  "/:id/priority",
  auth(Role.DISPATCHER),
  validateRequest(EmergencyValidation.UpdatePriorityZodSchema),
  EmergencyController.updateEmergencyPriority,
);

// // ইমার্জেন্সি ক্যানসেল করা
// router.patch(
//   "/:id/cancel",
//   auth(Role.ADMIN, Role.DISPATCHER),
//   EmergencyController.cancelEmergency,
// );

// // ইমার্জেন্সির অডিট বা ইনসিডেন্ট হিস্ট্রি দেখা
// router.get(
//   "/:id/history",
//   auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER),
//   EmergencyController.getEmergencyHistory,
// );

export const EmergencyRoutes = router;
