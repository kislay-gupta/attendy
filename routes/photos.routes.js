import { Router } from "express";
import {
  uploadPhoto,
  getUserPhotos,
  getPhotosByType,
  getPhotosByDateRange,
  getSinglePhoto,
  getAllPhotos,
} from "../controllers/photos.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply authentication to all routes

// Upload and get all photos
router.route("/").post(upload.single("file"), uploadPhoto).get(getUserPhotos);
router.route("/get-all-photo").get(getAllPhotos);
// Get photos by type (Punch In, Punch Out, Duty)
router.route("/type/:type").get(getPhotosByType);

// Get photos by date range
router.route("/date-range").get(getPhotosByDateRange);
router.route("/date-range-user").get(getPhotosByDateRange);

router.route("/:id").get(getSinglePhoto);
export default router;
