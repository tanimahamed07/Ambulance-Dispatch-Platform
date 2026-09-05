import { z } from "zod";

const createHospitalValidation = z.object({
  name: z.string("Hospital name is required"),
  phone: z.string("Phone number is required"),
  email: z.string().email().optional(),
  address: z.string("Address is required"),
  latitude: z.number("Latitude is required"),
  longitude: z.number("Longitude is required"),
  emergencyAvailable: z.boolean().optional(),
  specialties: z.array(z.string()).optional(),
});

const updateHospitalValidation = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  emergencyAvailable: z.boolean().optional(),
  specialties: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const HospitalValidation = {
  createHospitalValidation,
  updateHospitalValidation,
};
