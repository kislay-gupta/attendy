import { Router } from "express";
import {
  createLeaveRequest,
  getLeaves,
  updateLeaveStatus,
  getLeaveBalance,
} from "../controllers/leaves.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createLeaveRequest).get(getLeaves);
router.route("/balance").get(getLeaveBalance);
router.route("/:id/status").patch(updateLeaveStatus);

export default router;
