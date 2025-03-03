import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyDevice,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.single("file"), registerUser);
router.route("/login").post(loginUser);

// protected routes
router.route("/verify").post(verifyJWT, verifyDevice);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
