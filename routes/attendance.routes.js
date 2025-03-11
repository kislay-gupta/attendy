import { Router } from "express";
import { getAttendance } from "../controllers/attendance.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/").get(getAttendance);
export default router;
