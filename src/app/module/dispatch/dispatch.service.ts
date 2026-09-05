import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateDispatch } from "./dispatch.interface";
import {
  AmbulanceStatus,
  DispatchStatus,
  DriverApprovalStatus,
  EmergencyStatus,
} from "../../../generated/prisma/enums";
import { IQuery } from "../../interface";
import {
  AmbulanceWhereInput,
  DispatchWhereInput,
} from "../../../generated/prisma/models";

const createDispatch = async (payload: ICreateDispatch) => {
  const { emergencyId, driverId } = payload;

  // Use Prisma Transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Verify Emergency Request exists and is valid
    const emergency = await tx.emergencyRequest.findUnique({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new AppError(httpStatus.NOT_FOUND, "Emergency request not found");
    }

    // Check if emergency is in valid state for dispatch
    if (emergency.status !== EmergencyStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot dispatch emergency with status: ${emergency.status}. Only PENDING emergencies can be dispatched.`,
      );
    }

    // Check if emergency is already dispatched
    const existingDispatch = await tx.dispatch.findUnique({
      where: { emergencyId },
    });

    if (existingDispatch) {
      throw new AppError(
        httpStatus.CONFLICT,
        "This emergency has already been dispatched",
      );
    }

    // Step 2: Verify Driver exists and is available
    const driver = await tx.driver.findUnique({
      where: { id: driverId },
      include: {
        ambulance: true,
      },
    });

    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    // Check if driver is approved
    if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Driver is not approved. Current status: ${driver.approvalStatus}`,
      );
    }

    // Check if driver is available (on duty)
    if (!driver.isAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Driver is currently not available. Please select an available driver.",
      );
    }

    // Check if driver has an assigned ambulance
    if (!driver.ambulanceId || !driver.ambulance) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Driver does not have an assigned ambulance",
      );
    }

    // Step 3: Verify Ambulance is available
    const ambulance = driver.ambulance;

    if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Ambulance ${ambulance.ambulanceNumber} is not available. Current status: ${ambulance.status}`,
      );
    }

    // Check if driver already has an active dispatch
    const activeDispatch = await tx.dispatch.findFirst({
      where: {
        driverId,
        status: {
          in: [DispatchStatus.PENDING, DispatchStatus.ACCEPTED],
        },
      },
    });

    if (activeDispatch) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Driver already has an active dispatch assignment",
      );
    }

    // Step 4: Create Dispatch
    const dispatch = await tx.dispatch.create({
      data: {
        emergencyId,
        driverId,
        ambulanceId: ambulance.id,
        status: DispatchStatus.PENDING,
        dispatchedAt: new Date(),
      },
    });

    // Step 5: Update Emergency status
    await tx.emergencyRequest.update({
      where: { id: emergencyId },
      data: {
        status: EmergencyStatus.ASSIGNED,
      },
    });

    // Step 6: Update Ambulance status
    await tx.ambulance.update({
      where: { id: ambulance.id },
      data: {
        status: AmbulanceStatus.ASSIGNED,
      },
    });

    // Step 7: Mark driver as unavailable
    await tx.driver.update({
      where: { id: driverId },
      data: {
        isAvailable: false,
      },
    });

    return dispatch;
  });

  return result;
};


//  Get All Dispatches - For Admin & Dispatcher

const getAllDispatches = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "dispatchedAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: DispatchWhereInput[] = [];

  // Search by driver name, ambulance number, patient name, phone
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          driver: {
            user: {
              name: {
                contains: query.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
        {
          ambulance: {
            ambulanceNumber: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          emergency: {
            patientName: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          emergency: {
            patientPhone: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Dispatch Status filter (PENDING, ACCEPTED, REJECTED)
  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  // Emergency Type filter
  if (query.emergencyType) {
    andConditions.push({
      emergency: {
        emergencyType: query.emergencyType,
      },
    });
  }

  // Priority filter
  if (query.priority) {
    andConditions.push({
      emergency: {
        priority: query.priority,
      },
    });
  }

  // Driver filter
  if (query.driverId) {
    andConditions.push({
      driverId: query.driverId,
    });
  }

  // Ambulance filter
  if (query.ambulanceId) {
    andConditions.push({
      ambulanceId: query.ambulanceId,
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const dispatches = await prisma.dispatch.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      emergency: {
        include: {
          caller: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      driver: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      ambulance: {
        select: {
          id: true,
          ambulanceNumber: true,
          vehicleType: true,
          registrationNumber: true,
          model: true,
          status: true,
        },
      },
    },
  });

  const totalDispatchesCount = await prisma.dispatch.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total: totalDispatchesCount,
      totalPages: Math.ceil(totalDispatchesCount / limit),
    },
    data: dispatches,
  };
};

/**
 * Get Dispatch by ID
 */
// const getDispatchById = async (id: string) => {
//   const dispatch = await prisma.dispatch.findUnique({
//     where: { id },
//     include: {
//       emergency: {
//         include: {
//           caller: {
//             include: {
//               user: {
//                 select: {
//                   name: true,
//                   email: true,
//                   phone: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//       driver: {
//         include: {
//           user: {
//             select: {
//               name: true,
//               email: true,
//               phone: true,
//             },
//           },
//         },
//       },
//       ambulance: true,
//     },
//   });

//   if (!dispatch) {
//     throw new AppError(httpStatus.NOT_FOUND, "Dispatch not found");
//   }

//   return dispatch;
// };

// /**
//  * Driver Accepts Dispatch
//  */
// const acceptDispatch = async (dispatchId: string, driverId: string) => {
//   const result = await prisma.$transaction(async (tx) => {
//     // Find dispatch
//     const dispatch = await tx.dispatch.findUnique({
//       where: { id: dispatchId },
//       include: {
//         driver: true,
//         ambulance: true,
//         emergency: true,
//       },
//     });

//     if (!dispatch) {
//       throw new AppError(httpStatus.NOT_FOUND, "Dispatch not found");
//     }

//     // Verify it's the assigned driver
//     if (dispatch.driverId !== driverId) {
//       throw new AppError(
//         httpStatus.FORBIDDEN,
//         "You are not authorized to accept this dispatch",
//       );
//     }

//     // Check if already accepted or rejected
//     if (dispatch.status !== DispatchStatus.PENDING) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Dispatch is already ${dispatch.status.toLowerCase()}`,
//       );
//     }

//     // Update dispatch status
//     const updatedDispatch = await tx.dispatch.update({
//       where: { id: dispatchId },
//       data: {
//         status: DispatchStatus.ACCEPTED,
//         acceptedAt: new Date(),
//       },
//       include: {
//         emergency: true,
//         driver: {
//           include: {
//             user: {
//               select: {
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//         ambulance: true,
//       },
//     });

//     // Update emergency status to DISPATCHED
//     await tx.emergencyRequest.update({
//       where: { id: dispatch.emergencyId },
//       data: {
//         status: EmergencyStatus.DISPATCHED,
//       },
//     });

//     // Update ambulance status to EN_ROUTE
//     await tx.ambulance.update({
//       where: { id: dispatch.ambulanceId },
//       data: {
//         status: AmbulanceStatus.EN_ROUTE,
//       },
//     });

//     return updatedDispatch;
//   });

//   return result;
// };

// /**
//  * Driver Rejects Dispatch
//  */
// const rejectDispatch = async (dispatchId: string, driverId: string) => {
//   const result = await prisma.$transaction(async (tx) => {
//     // Find dispatch
//     const dispatch = await tx.dispatch.findUnique({
//       where: { id: dispatchId },
//       include: {
//         driver: true,
//         ambulance: true,
//         emergency: true,
//       },
//     });

//     if (!dispatch) {
//       throw new AppError(httpStatus.NOT_FOUND, "Dispatch not found");
//     }

//     // Verify it's the assigned driver
//     if (dispatch.driverId !== driverId) {
//       throw new AppError(
//         httpStatus.FORBIDDEN,
//         "You are not authorized to reject this dispatch",
//       );
//     }

//     // Check if already accepted or rejected
//     if (dispatch.status !== DispatchStatus.PENDING) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Cannot reject dispatch with status: ${dispatch.status}`,
//       );
//     }

//     // Update dispatch status
//     const updatedDispatch = await tx.dispatch.update({
//       where: { id: dispatchId },
//       data: {
//         status: DispatchStatus.REJECTED,
//       },
//       include: {
//         emergency: true,
//         driver: {
//           include: {
//             user: {
//               select: {
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//         ambulance: true,
//       },
//     });

//     // Revert emergency status back to PENDING
//     await tx.emergencyRequest.update({
//       where: { id: dispatch.emergencyId },
//       data: {
//         status: EmergencyStatus.PENDING,
//       },
//     });

//     // Revert ambulance status to AVAILABLE
//     await tx.ambulance.update({
//       where: { id: dispatch.ambulanceId },
//       data: {
//         status: AmbulanceStatus.AVAILABLE,
//       },
//     });

//     // Mark driver as available again
//     await tx.driver.update({
//       where: { id: driverId },
//       data: {
//         isAvailable: true,
//       },
//     });

//     return updatedDispatch;
//   });

//   return result;
// };

// /**
//  * Get My Dispatches - For Driver
//  */
// const getMyDispatches = async (driverId: string) => {
//   const dispatches = await prisma.dispatch.findMany({
//     where: {
//       driverId,
//     },
//     include: {
//       emergency: {
//         include: {
//           caller: {
//             include: {
//               user: {
//                 select: {
//                   name: true,
//                   email: true,
//                   phone: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//       ambulance: true,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return dispatches;
// };

export const DispatchService = {
  createDispatch,
  getAllDispatches,
  getDispatchById,
  // acceptDispatch,
  // rejectDispatch,
  // getMyDispatches,
};
