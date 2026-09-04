import { EmergencyType } from "../../../generated/prisma/enums";

export interface ICreateEmergencyPayload {
  patientName: string;
  patientPhone: string;
  emergencyType: EmergencyType;
  description?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
}
