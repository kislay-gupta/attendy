import { Router } from "express";
import { 
    uploadPhoto, 
    getUserPhotos, 
    getPhotosByType, 
    getPhotosByDateRange 
} from "../controllers/photos.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply authentication to all routes

// Upload and get all photos
router.route("/")
    .post(upload.single("file"), uploadPhoto)
    .get(getUserPhotos);

// Get photos by type (Punch In, Punch Out, Duty)
router.route("/type/:type")
    .get(getPhotosByType);

// Get photos by date range
router.route("/date-range")
    .get(getPhotosByDateRange);

export default router;
