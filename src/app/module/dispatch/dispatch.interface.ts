import { DispatchStatus } from "../../../generated/prisma/enums";

export interface ICreateDispatch {
  emergencyId: string;
  driverId: string;
}

export interface IAcceptDispatch {
  dispatchId: string;
}

export interface IRejectDispatch {
  dispatchId: string;
  reason?: string;
}

export interface ICancelDispatch {
  cancellationReason: string;
}
