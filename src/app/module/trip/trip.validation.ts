import { z } from "zod";

const CompleteTripZodSchema = z.object({
	distanceKm: z
		.number("Distance in kilometers is required")
		.min(0.1, {
			message: "Distance must be at least 0.1 km",
		})
		.max(500, {
			message: "Distance cannot exceed 500 km",
		}),
});

export const TripValidation = {
	CompleteTripZodSchema,
};
