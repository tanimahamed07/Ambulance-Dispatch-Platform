import { z } from "zod";

const CreateDispatchZodSchema = z.object({
  emergencyId: z
    .string("Emergency ID is required")
    .uuid("Invalid emergency ID format"),
  driverId: z.string("Driver ID is required").uuid("Invalid driver ID format"),
});

const AcceptDispatchZodSchema = z.object({
  dispatchId: z
    .string("Dispatch ID is required")
    .uuid("Invalid dispatch ID format"),
});

const RejectDispatchZodSchema = z.object({
  dispatchId: z
    .string("Dispatch ID is required")
    .uuid("Invalid dispatch ID format"),
  reason: z.string().optional(),
});

export const DispatchValidation = {
  CreateDispatchZodSchema,
  AcceptDispatchZodSchema,
  RejectDispatchZodSchema,
};
