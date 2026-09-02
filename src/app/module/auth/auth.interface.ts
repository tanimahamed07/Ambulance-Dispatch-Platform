import { Role } from "../../../generated/prisma/browser";

export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IRegisterCallerPayload {
  name: string;
  email: string;
  password: string;
  caller: {
    contactNumber?: string;
  };
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface IGoogleLoginPayload {
	idToken: string;
}


export interface IRequestUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}
