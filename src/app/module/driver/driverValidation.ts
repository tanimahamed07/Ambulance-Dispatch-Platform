import z from "zod";

const UpdateDutyStatusZodSchema = z.object({
  isAvailable: z.boolean("isAvailable is required"),
});

export const DriverValidation = {
  UpdateDutyStatusZodSchema,
};
