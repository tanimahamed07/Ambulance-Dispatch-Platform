import z from "zod";
import { EmergencyType, Priority } from "../../../generated/prisma/enums";

const CreateEmergencyZodSchema = z.object({
	patientName: z
		.string("Patient name is required")
		.min(2, "Patient name must be at least 2 characters long")
		.max(100, "Patient name must not exceed 100 characters"),
	patientPhone: z
		.string("Patient phone is required")
		.regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number format"),
	emergencyType: z.nativeEnum(EmergencyType, "Emergency type is required"),
	description: z
		.string()
		.max(500, "Description must not exceed 500 characters")
		.optional(),
	pickupAddress: z
		.string("Pickup address is required")
		.min(5, "Pickup address must be at least 5 characters long")
		.max(200, "Pickup address must not exceed 200 characters"),
	pickupLatitude: z
		.number("Pickup latitude is required")
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	pickupLongitude: z
		.number("Pickup longitude is required")
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
});

const UpdatePriorityZodSchema = z.object({
	priority: z.nativeEnum(Priority, "Invalid priority value"),
});

const CancelEmergencyZodSchema = z.object({
	cancellationReason: z
		.string()
		.max(500, "Cancellation reason must not exceed 500 characters")
		.optional(),
});

export const EmergencyValidation = {
	CreateEmergencyZodSchema,
	UpdatePriorityZodSchema,
	CancelEmergencyZodSchema,
};
