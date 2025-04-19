import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyDevice,
  getCurrentUser,
  getAllUser,
  getCurrentUserById,
  verifySession,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

// protected routesg
router.route("/all").get(verifyJWT, getAllUser);
router.route("/verify-session").get(verifyJWT, verifySession);
router.route("/verify").post(verifyJWT, verifyDevice);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/").get(verifyJWT, getCurrentUser);
router.route("/:userId").get(verifyJWT, getCurrentUserById);

export default router;
