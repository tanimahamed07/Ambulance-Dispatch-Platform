import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { TripController } from "./trip.controller";
import { TripValidation } from "./trip.validation";

const router = Router();

router.get("/", auth(Role.ADMIN, Role.DISPATCHER), TripController.getAllTrips);

router.get("/my-trips", auth(Role.DRIVER), TripController.getMyTrips);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER, Role.DRIVER, Role.CALLER),
	TripController.getTripById,
);

// Calculate fare for a trip (before completing)
router.get(
	"/:id/calculate-fare",
	auth(Role.DRIVER),
	TripController.calculateFare,
);

// Driver — state machine transitions
router.patch("/:id/en-route", auth(Role.DRIVER), TripController.markEnRoute);

router.patch("/:id/pickup", auth(Role.DRIVER), TripController.markPickedUp);

router.patch(
	"/:id/select-hospital",
	auth(Role.DRIVER),
	TripController.selectHospital,
);

router.patch(
	"/:id/hospital-arrival",
	auth(Role.DRIVER),
	TripController.markHospitalArrival,
);

router.patch(
	"/:id/complete",
	auth(Role.DRIVER),
	validateRequest(TripValidation.CompleteTripZodSchema),
	TripController.completeTrip,
);

// Admin/Dispatcher — emergency cancel হলে trip-ও cancel
router.patch(
	"/:id/cancel",
	auth(Role.ADMIN, Role.DISPATCHER),
	TripController.cancelTrip,
);

export const TripRoutes = router;
