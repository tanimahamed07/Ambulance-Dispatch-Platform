import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

const DEFAULT_PASSWORD = "Password1234!";
const SALT_ROUNDS = 10;

// 1. Seed Admin
export const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (isAdminExist) {
      console.log("Admin Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@test.com",
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

export const seedDispatcher = async () => {
  try {
    const email = "dispatcher@test.com";

    const isDispatcherExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isDispatcherExist) {
      console.log("Tester Dispatcher Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const dispatcher = await prisma.user.create({
      data: {
        name: "Test Dispatcher",
        email,
        password: hashedPassword,
        role: Role.DISPATCHER,
        emailVerified: true,
      },
    });

    console.log("Tester Dispatcher Created Successfully:", dispatcher.id);
  } catch (error) {
    console.error("Error Seeding Dispatcher:", error);
  }
};

// 2. Seed Tester Driver
export const seedTesterDriver = async () => {
  try {
    const email = "driver@test.com";

    const isDriverExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isDriverExist) {
      console.log("Tester Driver Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const testerDriver = await prisma.user.create({
      data: {
        name: "Test Driver",
        email,
        password: hashedPassword,
        role: Role.DRIVER,
        emailVerified: true,
        driver: {
          create: {
            address: "Mirpur, Dhaka, Bangladesh",
            licenseNumber: "DL-99999999",
            licenseUrl: "https://example.com/license.pdf",
            licensePublicId: "licenses/test_driver_lic",
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            nidNumber: "1990000000000",
            contactNumber: "+8801700000000",
            isAvailable : true
          },
        },
      },
      include: { driver: true },
    });

    console.log("Tester Driver Created Successfully:", testerDriver.id);
  } catch (error) {
    console.error("Error Seeding Tester Driver:", error);
  }
};

// 3. Seed Tester Caller
export const seedTesterCaller = async () => {
  try {
    const email = "caller@test.com";

    const isCallerExist = await prisma.user.findUnique({
      where: { email },
    });

    if (isCallerExist) {
      console.log("Tester Caller Already Exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const testerCaller = await prisma.user.create({
      data: {
        name: "Test Caller",
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

    console.log("Tester Caller Created Successfully:", testerCaller.id);
  } catch (error) {
    console.error("Error Seeding Tester Caller:", error);
  }
};
