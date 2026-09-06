import z from "zod";
import {
	AmbulanceStatus,
	AmbulanceType,
} from "../../../generated/prisma/enums";

const CreateAmbulanceZodSchema = z.object({
	ambulanceNumber: z
		.string("Ambulance Number is required")
		.min(3, "Ambulance number must be at least 3 characters long")
		.max(50, "Ambulance number must not exceed 50 characters"),
	registrationNumber: z
		.string("Registration Number is required")
		.min(3, "Registration number must be at least 3 characters long")
		.max(100, "Registration number must not exceed 100 characters"),
	registrationExpiry: z
		.string("Registration expiry is required")
		.min(1, "Registration expiry cannot be empty"),
	vehicleType: z.nativeEnum(AmbulanceType, "Invalid vehicle type"),
	model: z
		.string()
		.min(1, "Model cannot be empty if provided")
		.max(100, "Model must not exceed 100 characters"),
	capacity: z
		.number("Capacity must be a number")
		.int("Capacity must be an integer")
		.positive("Capacity must be a positive number")
		.min(1, "Capacity must be at least 1")
		.max(20, "Capacity must not exceed 20"),
});

const UpdateAmbulanceZodSchema = z.object({
	ambulanceNumber: z
		.string()
		.min(3, "Ambulance number must be at least 3 characters long")
		.max(50, "Ambulance number must not exceed 50 characters")
		.optional(),
	registrationNumber: z
		.string()
		.min(3, "Registration number must be at least 3 characters long")
		.max(100, "Registration number must not exceed 100 characters")
		.optional(),
	registrationExpiry: z
		.string()
		.min(1, "Registration expiry cannot be empty")
		.optional(),
	vehicleType: z.nativeEnum(AmbulanceType, "Invalid vehicle type").optional(),
	model: z
		.string()
		.min(1, "Model cannot be empty if provided")
		.max(100, "Model must not exceed 100 characters")
		.optional(),
	capacity: z
		.number("Capacity must be a number")
		.int("Capacity must be an integer")
		.positive("Capacity must be a positive number")
		.min(1, "Capacity must be at least 1")
		.max(20, "Capacity must not exceed 20")
		.optional(),
	status: z.nativeEnum(AmbulanceStatus, "Invalid ambulance status").optional(),
});

const UpdateLocationZodSchema = z.object({
	latitude: z
		.number("Latitude is required")
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	longitude: z
		.number("Longitude is required")
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
});

export const AmbulanceValidation = {
	CreateAmbulanceZodSchema,
	UpdateAmbulanceZodSchema,
	UpdateLocationZodSchema,
};
