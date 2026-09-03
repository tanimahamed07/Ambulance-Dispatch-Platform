import {
  AmbulanceStatus,
  AmbulanceType,
} from "../../../generated/prisma/enums";

export interface ICreateAmbulancePayload {
  ambulanceNumber: string;
  registrationNumber: string;
  registrationExpiry: string;
  vehicleType: AmbulanceType;
  model: string;
  capacity: number;
}

export interface IUpdateAmbulancePayload {
  ambulanceNumber?: string;
  registrationNumber?: string;
  registrationExpiry?: string;
  vehicleType?: AmbulanceType;
  model?: string;
  capacity?: number;
  status?: AmbulanceStatus;
}
