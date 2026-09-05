import { HospitalStatus } from "../../../generated/prisma/enums";

export interface ICreateHospital {
  name: string;
  phone: string;
  email?: string;
  address: string;
  latitude: number;
  longitude: number;
  emergencyAvailable?: boolean;
  specialties?: string[];
}

export interface IUpdateHospital {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  emergencyAvailable?: boolean;
  specialties?: string[];
  status?: HospitalStatus;
}
