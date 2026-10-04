import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import config from "../config";


const SALT_ROUNDS = Number(config.bcrypt_salt_rounds) || 10;

// 1. Seed Admin
export const seedAdmin = async () => {
  try {
    const email = config.super_admin.email;

    const isAdminExist = await prisma.user.findFirst({
      where: {
        OR: [{ role: Role.ADMIN }, { email }],
      },
    });

    if (isAdminExist) {
      console.log("Admin Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin.password,
      SALT_ROUNDS
    );

    const admin = await prisma.user.create({
      data: {
        name: config.super_admin.name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });

    console.log("Admin Created Successfully:", admin.id);
  } catch (error) {
    console.error("Error Seeding Admin:", error);
  }
};

// 2. Seed Dispatcher
export const seedDispatcher = async () => {
  try {
    const email = config.dispatcher.email;

    const isDispatcherExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isDispatcherExist) {
      console.log("Dispatcher Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.dispatcher.password,
      SALT_ROUNDS
    );

    const dispatcher = await prisma.user.create({
      data: {
        name: config.dispatcher.name,
        email,
        password: hashedPassword,
        role: Role.DISPATCHER,
        emailVerified: true,
      },
    });

    console.log("Dispatcher Created Successfully:", dispatcher.id);
  } catch (error) {
    console.error("Error Seeding Dispatcher:", error);
  }
};

// 3. Seed Driver
export const seedTesterDriver = async () => {
  try {
    const email = config.driver.email;

    const isDriverExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isDriverExist) {
      console.log("Driver Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.driver.password,
      SALT_ROUNDS
    );

    const driver = await prisma.user.create({
      data: {
        name: config.driver.name,
        email,
        password: hashedPassword,
        role: Role.DRIVER,
        emailVerified: true,
        driver: {
          create: {
            address: "Mirpur, Dhaka, Bangladesh",
            licenseNumber: "DL-999999993",
            licenseUrl: "https://example.com/license.pdf",
            licensePublicId: "licenses/test_driver_licw",
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            nidNumber: "19900000000004",
            contactNumber: "+8801700000000",
            isAvailable: true,
          },
        },
      },
      include: { driver: true },
    });

    console.log("Driver Created Successfully:", driver.id);
  } catch (error) {
    console.error("Error Seeding Driver:", error);
  }
};

// 4. Seed Caller
export const seedTesterCaller = async () => {
  try {
    const email = config.caller.email;

    const isCallerExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isCallerExist) {
      console.log("Caller Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.caller.password,
      SALT_ROUNDS
    );

    const caller = await prisma.user.create({
      data: {
        name: config.caller.name,
        email,
        password: hashedPassword,
        role: Role.CALLER,
        emailVerified: true,
        caller: {
          create: {
            contactNumber: "+8801800000000",
            address: "Dhaka, Bangladesh",
          },
        },
      },
      include: { caller: true },
    });

    console.log("Caller Created Successfully:", caller.id);
  } catch (error) {
    console.error("Error Seeding Caller:", error);
  }
};