import {
  DriverApprovalStatus,
  RejectionReason,
} from "../../../generated/prisma/enums";

export interface IApplyAsDriverPayload {
  contactNumber: string;
  address: String;
  licenseNumber: String;
  licenseUrl: String;
  licensePublicId: String;
  licenseExpiry: Date;
  nidNumber: String;
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
