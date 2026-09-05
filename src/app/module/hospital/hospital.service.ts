import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateHospital, IUpdateHospital } from "./hospital.interface";
import { IQuery } from "../../interface";
import { HospitalWhereInput } from "../../../generated/prisma/models";
import { HospitalStatus } from "../../../generated/prisma/enums";

const createHospital = async (payload: ICreateHospital) => {
  // Check if hospital with same name and address already exists
  const existingHospital = await prisma.hospital.findFirst({
    where: {
      name: payload.name,
      address: payload.address,
    },
  });

  if (existingHospital) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Hospital with this name and address already exists",
    );
  }

  const hospital = await prisma.hospital.create({
    data: {
      status: HospitalStatus.ACTIVE,
      ...payload,
    },
  });

  return hospital;
};

/**
 * Get All Hospitals - With filters and search
 */
const getAllHospitals = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: HospitalWhereInput[] = [];

  // Search by name, address, phone
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Status filter (ACTIVE, INACTIVE)
  if (query.status) {
    andConditions.push({
      status: query.status.toUpperCase() as HospitalStatus,
    });
  }

  // Emergency available filter
  if (query.emergencyAvailable !== undefined) {
    andConditions.push({
      emergencyAvailable: query.emergencyAvailable === "true",
    });
  }

  // Specialty filter
  if (query.specialty) {
    const normalizedSpecialty = query.specialty.trim().toLowerCase();
    andConditions.push({
      specialties: {
        has: normalizedSpecialty,
      },
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const hospitals = await prisma.hospital.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalHospitalsCount = await prisma.hospital.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total: totalHospitalsCount,
      totalPages: Math.ceil(totalHospitalsCount / limit),
    },
    data: hospitals,
  };
};

// /**
//  * Get Hospital by ID
//  */
// const getHospitalById = async (id: string) => {
//   const hospital = await prisma.hospital.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       address: true,
//       latitude: true,
//       longitude: true,
//       emergencyAvailable: true,
//       specialties: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//       _count: {
//         select: {
//           trips: true,
//         },
//       },
//     },
//   });

//   if (!hospital) {
//     throw new AppError(httpStatus.NOT_FOUND, "Hospital not found");
//   }

//   return hospital;
// };

// /**
//  * Update Hospital - Admin only
//  */
// const updateHospital = async (id: string, payload: IUpdateHospital) => {
//   // Check if hospital exists
//   const hospital = await prisma.hospital.findUnique({
//     where: { id },
//   });

//   if (!hospital) {
//     throw new AppError(httpStatus.NOT_FOUND, "Hospital not found");
//   }

//   // If updating name and address, check for duplicates
//   if (payload.name || payload.address) {
//     const existingHospital = await prisma.hospital.findFirst({
//       where: {
//         name: payload.name || hospital.name,
//         address: payload.address || hospital.address,
//         id: { not: id },
//       },
//     });

//     if (existingHospital) {
//       throw new AppError(
//         httpStatus.CONFLICT,
//         "Hospital with this name and address already exists",
//       );
//     }
//   }

//   const updatedHospital = await prisma.hospital.update({
//     where: { id },
//     data: payload,
//   });

//   return updatedHospital;
// };

// /**
//  * Delete Hospital - Admin only (Soft delete by setting status to INACTIVE)
//  */
// const deleteHospital = async (id: string) => {
//   // Check if hospital exists
//   const hospital = await prisma.hospital.findUnique({
//     where: { id },
//   });

//   if (!hospital) {
//     throw new AppError(httpStatus.NOT_FOUND, "Hospital not found");
//   }

//   // Check if hospital has active trips
//   const activeTripsCount = await prisma.trip.count({
//     where: {
//       hospitalId: id,
//       status: {
//         notIn: ["COMPLETED", "CANCELLED"],
//       },
//     },
//   });

//   if (activeTripsCount > 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Cannot delete hospital with active trips. Please complete or cancel all trips first.",
//     );
//   }

//   // Soft delete by setting status to INACTIVE
//   const deletedHospital = await prisma.hospital.update({
//     where: { id },
//     data: {
//       status: HospitalStatus.INACTIVE,
//     },
//   });

//   return deletedHospital;
// };

// /**
//  * Get Nearby Hospitals - Based on coordinates
//  */
// const getNearbyHospitals = async (
//   latitude: number,
//   longitude: number,
//   radius: number = 10,
// ) => {
//   // Simple radius-based search using Haversine formula approximation
//   // For production, consider using PostGIS or similar spatial database extension

//   const hospitals = await prisma.hospital.findMany({
//     where: {
//       status: HospitalStatus.ACTIVE,
//       emergencyAvailable: true,
//     },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       address: true,
//       latitude: true,
//       longitude: true,
//       specialties: true,
//       emergencyAvailable: true,
//     },
//   });

//   // Calculate distance and filter by radius
//   const hospitalsWithDistance = hospitals.map((hospital) => {
//     const distance = calculateDistance(
//       latitude,
//       longitude,
//       hospital.latitude,
//       hospital.longitude,
//     );

//     return {
//       ...hospital,
//       distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
//     };
//   });

//   // Filter by radius and sort by distance
//   const nearbyHospitals = hospitalsWithDistance
//     .filter((hospital) => hospital.distance <= radius)
//     .sort((a, b) => a.distance - b.distance);

//   return nearbyHospitals;
// };

// /**
//  * Calculate distance between two coordinates using Haversine formula
//  * Returns distance in kilometers
//  */
// function calculateDistance(
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number,
// ): number {
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c;

//   return distance;
// }

// function toRadians(degrees: number): number {
//   return degrees * (Math.PI / 180);
// }

export const HospitalService = {
  createHospital,
  getAllHospitals,
  //   getHospitalById,
  //   updateHospital,
  //   deleteHospital,
  //   getNearbyHospitals,
};
