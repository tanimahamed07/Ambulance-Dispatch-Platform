import { z } from "zod";

const CompleteTripZodSchema = z.object({
  body: z.object({
    distanceKm: z
      .number("Distance in kilometers is required")
      .min(0.1, {
        message: "Distance must be at least 0.1 km",
      })
      .max(500, {
        message: "Distance cannot exceed 500 km",
      }),
    fare: z
      .number("Fare amount is required")
      .min(100, {
        message: "Fare must be at least 100 Tk",
      })
      .max(50000, {
        message: "Fare cannot exceed 50000 Tk",
      }),
  }),
});

export const TripValidation = {
  CompleteTripZodSchema,
};
