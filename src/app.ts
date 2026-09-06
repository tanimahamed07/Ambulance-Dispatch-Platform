import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AmbulanceRoutes } from "./app/module/ambulance/ambulance.route";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { DispatchRoutes } from "./app/module/dispatch/dispatch.route";
import { DriverRoutes } from "./app/module/driver/driver.route";
import { EmergencyRoutes } from "./app/module/emergency/emergency.route";
import { HospitalRoutes } from "./app/module/hospital/hospital.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { TripRoutes } from "./app/module/trip/trip.route";
import { UserRoutes } from "./app/module/user/user.route";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/driver", DriverRoutes);
app.use("/api/v1/ambulance", AmbulanceRoutes);
app.use("/api/v1/emergency", EmergencyRoutes);
app.use("/api/v1/dispatch", DispatchRoutes);
app.use("/api/v1/hospital", HospitalRoutes);
app.use("/api/v1/trip", TripRoutes);
app.use("/api/v1/payment", PaymentRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to PH Healthcare System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
