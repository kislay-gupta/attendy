import { Router } from "express";
import {
  registerOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getAllOrganizations,
  addUserToOrganization,
} from "../controllers/organizations.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getAllOrganizations)
  .post(upload.single("file"), registerOrganization);
router.route("/:id").get(getOrganization).patch(updateOrganization);

export default router;
