import { Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IRequestUser } from "../auth/auth.interface";

/**
 * Initiate Payment - Create payment and get bKash payment URL
 * Similar to bookAppointment
 */
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PaymentService.initiatePayment(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Initiated Successfully. Redirect User To Payment URL",
    data: result,
  });
});

/**
 * Retry Payment - Retry payment for failed/cancelled payment
 * Similar to payAppointment
 */
const retryPayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PaymentService.retryPayment(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Retry Initiated. Redirect User To Payment URL",
    data: result,
  });
});

/**
 * Payment Callback - Handle bKash callback
 * Similar to bookAppointmentCallback
 */
const paymentCallback = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentCallback(req.query);

  // Redirect to frontend
  return res.redirect(result.redirectUrl);
});

/**
 * Get My Payment - Get payment details for a trip
 */
const getMyPayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const tripId = req.params.tripId;

  const result = await PaymentService.getMyPayment(user, tripId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Retrieved Successfully",
    data: result,
  });
});

/**
 * Query Payment Status - Sync payment status with bKash
 */
const queryPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentID } = req.body;
  const result = await PaymentService.queryPaymentStatus(paymentID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Status Synced Successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  retryPayment,
  paymentCallback,
  getMyPayment,
  queryPaymentStatus,
};
