import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./authValidation";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.CallerRegistrationZodSchema),
	AuthController.registerPatient,
);

router.post(
	"/verify-email",
	validateRequest(UserValidation.CallerEmailVerifyZodSchema),
	AuthController.verifyCallerEmail,
);

router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);

router.get(
	"/me",
	auth(Role.ADMIN, Role.CALLER, Role.DRIVER, Role.DISPATCHER, Role.ADMIN),
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);

router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);

router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);

export const AuthRoutes = router;
