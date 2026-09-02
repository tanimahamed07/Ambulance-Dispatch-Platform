import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { auth } from "../../middleware/checkAuth";
import { upload } from "../../lib/multer";
import { UserController } from "./user.controller";

const router = Router();

router.patch(
  "/profile-image",
  auth(Role.ADMIN, Role.DRIVER, Role.DISPATCHER, Role.CALLER),
  upload.single("profileImage"),
  UserController.uploadProfileImage,
);

export const UserRoutes = router;
