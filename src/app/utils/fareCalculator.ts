import { Priority } from "../../generated/prisma/enums";

/**
 * Fare Calculation System for Ambulance Trips
 *
 * Formula:
 * Total Fare = Base Fare + (Distance × Per KM Rate)
 *
 * Base Fare: 200 Tk
 *
 * Per KM Rates based on Priority:
 * - CRITICAL: 100 Tk/km
 * - HIGH: 80 Tk/km
 * - MEDIUM: 60 Tk/km
 * - LOW: 50 Tk/km
 *
 * @param distanceKm - Distance traveled in kilometers
 * @param priority - Emergency priority level
 * @returns Calculated fare in Taka (rounded to nearest integer)
 */
export const calculateFare = (
	distanceKm: number,
	priority: Priority,
): number => {
	const baseFare = 200;

	let perKmRate: number;
	switch (priority) {
		case Priority.CRITICAL:
			perKmRate = 100;
			break;
		case Priority.HIGH:
			perKmRate = 80;
			break;
		case Priority.MEDIUM:
			perKmRate = 60;
			break;
		case Priority.LOW:
			perKmRate = 50;
			break;
		default:
			perKmRate = 60;
	}

	const totalFare = baseFare + distanceKm * perKmRate;
	return Math.round(totalFare);
};

/**
 * Get Per KM Rate based on Priority
 * @param priority - Emergency priority level
 * @returns Per kilometer rate in Taka
 */
export const getPerKmRate = (priority: Priority): number => {
	switch (priority) {
		case Priority.CRITICAL:
			return 100;
		case Priority.HIGH:
			return 80;
		case Priority.MEDIUM:
			return 60;
		case Priority.LOW:
			return 50;
		default:
			return 60;
	}
};

/**
 * Get Base Fare (constant for all trips)
 * @returns Base fare in Taka
 */
export const getBaseFare = (): number => {
	return 200;
};

/**
 * Calculate fare breakdown for display purposes
 * @param distanceKm - Distance traveled in kilometers
 * @param priority - Emergency priority level
 * @returns Object containing fare breakdown details
 */
export const getFareBreakdown = (
	distanceKm: number,
	priority: Priority,
): {
	baseFare: number;
	perKmRate: number;
	distanceKm: number;
	distanceCost: number;
	totalFare: number;
	priority: Priority;
} => {
	const baseFare = getBaseFare();
	const perKmRate = getPerKmRate(priority);
	const distanceCost = Math.round(distanceKm * perKmRate);
	const totalFare = baseFare + distanceCost;

	return {
		baseFare,
		perKmRate,
		distanceKm,
		distanceCost,
		totalFare,
		priority,
	};
};
