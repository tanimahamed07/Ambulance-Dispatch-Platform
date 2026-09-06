import type {
	DriverApprovalStatus,
	RejectionReason,
} from "../../../generated/prisma/enums";

export interface IApplyAsDriverPayload {
	contactNumber: string;
	address: string;
	licenseNumber: string;
	licenseUrl: string;
	licensePublicId: string;
	licenseExpiry: Date;
	nidNumber: string;
}

export interface IApproveDriverPayload {
	driverId: string;
	approvalStatus: DriverApprovalStatus;
	rejectionReason?: RejectionReason;
	rejectionNote?: string;
}

export interface IUpdateDutyStatusPayload {
	isAvailable: boolean;
}
