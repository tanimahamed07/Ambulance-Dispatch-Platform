import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import httpStatus from "http-status";
import {
    IForgotPasswordPayload,
  IGoogleLoginPayload,
  ILoginUserPayload,
  IRegisterCallerPayload,
  IRequestUser,
  IVerifyEmailPayload,
} from "./auth.interface";
import { AppError } from "../../utils/AppError";
import { redisClient } from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import crypto from "crypto";
import { transporter } from "../../lib/nodemailer";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";

const registerPatient = async (payload: IRegisterCallerPayload) => {
  const { name, password, caller: callerData } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const expirationSeconds = 5 * 60;

  const otpKey = `caller-registration-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const callerRegistrationKey = `caller-registration-data:${email}`;
  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
    caller: callerData,
  };

  await redisClient.set(
    callerRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: {
        type: "EX",
        value: expirationSeconds,
      },
    },
  );

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

  const templateData = {
    name,
    email,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Email Verification",
    // text : `Your OTP is ${otp}`
    // html: `<h1>Your OTP is ${otp}</h1>`
    html,
  });
};

const verifyCallerEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist?.status === "BLOCKED") {
    throw new Error("User is Blocked");
  }

  if (isUserExist?.emailVerified) {
    throw new Error("Email ALready Verified");
  }

  if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
    throw new Error("User is Deleted");
  }

  const otpKey = `caller-registration-otp:${email}`;

  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new Error("Invalid OTP");
  }

  if (redisOtp !== otp) {
    throw new Error("OTP Does Not Match");
  }

  await redisClient.del(otpKey);

  const callerRegistrationKey = `caller-registration-data:${email}`;

  const redisCallerData = await redisClient.get(callerRegistrationKey);

  if (!redisCallerData) {
    throw new Error("Caller Doesnt Exist");
  }

  const callerPayload: IRegisterCallerPayload = JSON.parse(redisCallerData);

  const createdUser = await prisma.user.create({
    data: {
      name: callerPayload.name,
      email: callerPayload.email,
      password: callerPayload.password,
      role: Role.CALLER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      caller: {
        create: {
          contactNumber: callerPayload?.caller?.contactNumber || "",
        },
      },
    },
    omit: { password: true },
    include: { caller: true },
  });

  await redisClient.del(callerRegistrationKey);

  const tempatePath = path.join(
    process.cwd(),
    "src/app/templates/caller-welcome-email.ejs",
  );

  const templateData = {
    name: createdUser.name,
  };

  const html = await ejs.renderFile(tempatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Welcome to Emergency Ambulance Dispatch System",
    // text : `Your OTP is ${otp}`
    // html: `<h1>Your OTP is ${otp}</h1>`
    html,
  });

  const { caller, ...user } = createdUser;
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    caller,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      caller: true,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExists) {
    throw new Error("User not found");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new Error(
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new Error("User is inactive or not found");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });

    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log("Google ID Token Verification Failed", error);
    throw new Error("Invalid Or Expired Google Id Token");
  }

  if (!googleIdTokenPayload) {
    throw new Error("Invalid Or Expired Google Id Token");
  }

  if (!googleIdTokenPayload.email) {
    throw new Error("Google Email Not Found");
  }
  if (!googleIdTokenPayload.name) {
    throw new Error("Google Email User Name Not Found");
  }

  const ifCallerExistWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      role: Role.CALLER,
      googleId: googleIdTokenPayload.sub,
    },
  });

  let user = ifCallerExistWithGoogleAuth;

  if (!ifCallerExistWithGoogleAuth) {
    const ifCallerExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        role: Role.CALLER,
        authProvider: AuthProvider.GOOGLE,
      },
    });

    if (ifCallerExistWithCredentials) {
      if (!ifCallerExistWithCredentials.emailVerified) {
        throw new Error("Email Not Verified");
      }

      if (ifCallerExistWithCredentials.status === UserStatus.BLOCKED) {
        throw new Error("User Is Blocked");
      }

      if (
        ifCallerExistWithCredentials.isDeleted ||
        ifCallerExistWithCredentials.status === UserStatus.DELETED
      ) {
        throw new Error("User Is Deleted");
      }

      user = await prisma.user.update({
        where: {
          id: ifCallerExistWithCredentials.id,
        },

        data: {
          googleId: googleIdTokenPayload.sub,
        },
      });
    } else {
      // Google Register
      user = await prisma.user.create({
        data: {
          name: googleIdTokenPayload.name,
          email: googleIdTokenPayload.email,
          role: Role.CALLER,
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
          emailVerified: true,
          caller: {
            create: {
              name: googleIdTokenPayload.name,
              email: googleIdTokenPayload.email,
            },
          },
        },
      });
      const tempatePath = path.join(
        process.cwd(),
        "src/app/templates/caller-welcome-email.ejs",
      );

      const templateData = {
        name: user.name,
      };

      const html = await ejs.renderFile(tempatePath, templateData);

      await transporter.sendMail({
        from: config.email_sender,
        to: user.email,
        subject: "Welcome To PH Healthcare System",
        // text : `Your OTP is ${otp}`
        // html: `<h1>Your OTP is ${otp}</h1>`
        html,
      });
    }
  }

  if (!user) {
    throw new Error("User Not Found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new Error("User Is Blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new Error("User Is Deleted");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const { email } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new Error("User Does Not Exist!");
  }

  if (isUserExist.status === "BLOCKED") {
    throw new Error("User is Blocked");
  }

  if (!isUserExist.emailVerified) {
    throw new Error("User Not Verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
    throw new Error("User is Deleted");
  }

  if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
    throw new Error("User Has Account With Google");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  const key = `forgot-password-otp:${isUserExist.email}`;

  const expirationSeconds = 5 * 60;

  await redisClient.set(key, otp, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/forgot-password.ejs",
  );

  const templateData = {
    name: isUserExist.name,
    otp,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.email_sender,
    to: isUserExist.email,
    subject: "Forgot Password",
    // text : `Your OTP is ${otp}`
    // html: `<h1>Your OTP is ${otp}</h1>`
    html,
  });
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  refreshToken,
  verifyCallerEmail,
  googleLogin,
  forgotPassword,
};
