import { Router } from "express";

import { uploadPhoto } from "../controllers/photos.controllers.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(upload.single("file"), uploadPhoto);

export default router;
