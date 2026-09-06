import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

/**
 * Initiate Payment for a Trip
 * POST /api/payment/initiate
 * Caller initiates payment for their trip
 */
router.post(
  "/initiate",
  auth(Role.CALLER),
  validateRequest(PaymentValidation.InitiatePaymentZodSchema),
  PaymentController.initiatePayment,
);

/**
 * Retry Payment for a Failed/Cancelled Payment
 * POST /api/payment/retry
 * Caller retries payment for a trip
 */
router.post(
  "/retry",
  auth(Role.CALLER),
  validateRequest(PaymentValidation.RetryPaymentZodSchema),
  PaymentController.retryPayment,
);

/**
 * Payment Callback from bKash
 * GET /api/payment/callback
 * Public endpoint - no auth needed (bKash will call this)
 */
router.get("/callback", PaymentController.paymentCallback);

/**
 * Get My Payment Details
 * GET /api/payment/my-payment/:tripId
 * Caller gets their payment details for a specific trip
 */
router.get(
  "/my-payment/:tripId",
  auth(Role.CALLER),
  PaymentController.getMyPayment,
);

/**
 * Query Payment Status (Admin/Dispatcher)
 * POST /api/payment/query-status
 * Admin or Dispatcher can query payment status from bKash
 */
router.post(
  "/query-status",
  auth(Role.ADMIN, Role.DISPATCHER),
  PaymentController.queryPaymentStatus,
);

export const PaymentRoutes = router;
