import type { EmergencyType, Priority } from "../../../generated/prisma/enums";

export interface ICreateEmergencyPayload {
	patientName: string;
	patientPhone: string;
	emergencyType: EmergencyType;
	description?: string;
	pickupAddress: string;
	pickupLatitude: number;
	pickupLongitude: number;
}

export interface IUpdateEmergencyPriority {
	priority: Priority;
}

export interface ICancelEmergency {
	cancellationReason?: string;
}
