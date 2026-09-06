import { z } from "zod";

const CreateDispatchZodSchema = z.object({
	emergencyId: z
		.string("Emergency ID is required")
		.uuid("Invalid emergency ID format"),
	driverId: z.string("Driver ID is required").uuid("Invalid driver ID format"),
});

export const DispatchValidation = {
	CreateDispatchZodSchema,
};
