import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { IRequestUser } from "../auth/auth.interface";
import { PaymentService } from "./payment.service";

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
const paymentCallback = async (req: Request, res: Response) => {
	try {
		const result = await PaymentService.paymentCallback(req.query);

		// Redirect to frontend
		return res.redirect(result.redirectUrl);
	} catch (error) {
		// If any error occurs, redirect to frontend error page
		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
		return res.redirect(
			`${frontendUrl}/caller/payment-status?payment=error`,
		);
	}
};

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
 * Get All My Payments - Get all payment history for logged-in caller
 */
const getAllMyPayments = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;

	const result = await PaymentService.getAllMyPayments(user, req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All Payments Retrieved Successfully",
		meta: result.meta,
		data: result.data,
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
	getAllMyPayments,
	queryPaymentStatus,
};
