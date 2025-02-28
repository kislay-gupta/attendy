import { Router } from "express";

import { uploadPhoto } from "../controllers/photos.controllers.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/").post(upload.single("file"), uploadPhoto);

export default router;
