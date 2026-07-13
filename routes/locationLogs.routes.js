import { Router } from "express";
import {
  uploadLocationLogs,
  getLocationHistory,
} from "../controllers/locationLogs.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(uploadLocationLogs);
router.route("/history").get(getLocationHistory);

export default router;
