import { Router } from "express";
import {
  createTask,
  getTasks,
  checkInTask,
  completeTask,
  deleteTask,
} from "../controllers/tasks.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTask).get(getTasks);
router.route("/:id").delete(deleteTask);
router.route("/:id/check-in").patch(upload.single("checkInPhoto"), checkInTask);
router
  .route("/:id/complete")
  .patch(upload.single("checkOutPhoto"), completeTask);

export default router;
