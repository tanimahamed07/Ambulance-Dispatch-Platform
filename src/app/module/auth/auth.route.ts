import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerPatient);

router.post("/verify-email", AuthController.verifyCallerEmail);

router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.CALLER, Role.DRIVER, Role.DISPATCHER, Role.ADMIN),
  AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);

router.post(
  "/forgot-password",
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  AuthController.resetPassword,
);

export const AuthRoutes = router;
