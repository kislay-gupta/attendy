import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Photo } from "../models/photo.model.js";

const uploadPhoto = asyncHandler(async (req, res) => {
  const { latitude, longitude, photoType, timestamp } = req.body;

  if (!latitude || !longitude || !photoType) {
    throw new ApiError(400, "Latitude, longitude and photoType are required");
  }

  if (!["Punch In", "Punch Out", "Duty"].includes(photoType)) {
    throw new ApiError(400, "Invalid photo type");
  }

  if (!req.file) {
    throw new ApiError(400, "Photo file is required");
  }

  try {
    const photo = await Photo.create({
      img: req.file.path,
      latitude,
      longitude,
      photoType,
      timestamp,
      user: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, photo, "Photo uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to upload the photo");
  }
});

const getUserPhotos = asyncHandler(async (req, res) => {
  const photos = await Photo.find({ user: req.user._id })
    .sort({ timestamp: -1 })
    .populate("user", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});

const getPhotosByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  if (!["Punch In", "Punch Out", "Duty"].includes(type)) {
    throw new ApiError(400, "Invalid photo type");
  }

  const photos = await Photo.find({
    user: req.user._id,
    photoType: type,
  })
    .sort({ timestamp: -1 })
    .populate("user", "name email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, photos, `${type} photos retrieved successfully`)
    );
});

const getPhotosByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }

  const photos = await Photo.find({
    user: req.user._id,
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  })
    .sort({ timestamp: -1 })
    .populate("user", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});

export { uploadPhoto, getUserPhotos, getPhotosByType, getPhotosByDateRange };
