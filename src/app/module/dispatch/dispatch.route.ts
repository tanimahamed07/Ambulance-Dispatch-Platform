import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DispatchController } from "./dispatch.controller";
import { DispatchValidation } from "./dispatch.validation";

const router = Router();

// Create Dispatch - Only DISPATCHER can create
router.post(
  "/create-dispatch",
  auth(Role.DISPATCHER),
  validateRequest(DispatchValidation.CreateDispatchZodSchema),
  DispatchController.createDispatch,
);

router.get(
  "/",
  auth(Role.DISPATCHER, Role.ADMIN),
  DispatchController.getAllDispatches,
);

// Get My Dispatches - Driver sees their own dispatches
router.get(
  "/my-dispatches",
  auth(Role.DRIVER),
  DispatchController.getMyDispatches,
);

// Get Dispatch by ID
router.get(
  "/:id",
  auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER),
  DispatchController.getDispatchById,
);

// // Driver accepts dispatch
// router.patch(
//   "/:id/accept",
//   auth(Role.DRIVER),
//   DispatchController.acceptDispatch,
// );

// // Driver rejects dispatch
// router.patch(
//   "/:id/reject",
//   auth(Role.DRIVER),
//   DispatchController.rejectDispatch,
// );

export const DispatchRoutes = router;
