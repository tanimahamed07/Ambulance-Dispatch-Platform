import { z } from "zod";

const InitiatePaymentZodSchema = z.object({
	tripId: z.string("Trip ID is required").uuid("Invalid trip ID format"),
});

const RetryPaymentZodSchema = z.object({
	body: z.object({
		tripId: z.string("Trip ID is required").uuid({
			message: "Invalid trip ID format",
		}),
	}),
});

export const PaymentValidation = {
	InitiatePaymentZodSchema,
	RetryPaymentZodSchema,
};
