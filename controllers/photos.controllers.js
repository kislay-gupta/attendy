import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Photo } from "../models/photo.model.js";
import mongoose from "mongoose";
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
const getAllPhotos = asyncHandler(async (req, res) => {
  const photos = await Photo.find({})
    .sort({ timestamp: -1 })
    .populate("user", "fullName email organization");

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});
const getUserPhotos = asyncHandler(async (req, res) => {
  const photos = await Photo.find({ user: req.user._id })
    .sort({ timestamp: -1 })
    .populate("user", "fullName email");

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});
const getSinglePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json(new ApiResponse(400, [], "Invalid photo ID"));
    throw new ApiError(400, "Invalid photo ID");
  }

  const photo = await Photo.findById(id);

  if (!photo) {
    res.status(404).json(new ApiResponse(404, [], "Photo not found"));
    throw new ApiError(404, "Photo not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, photo, "Photo retrieved successfully"));
});
const getPhotosByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  if (!["Punch In", "Punch Out", "Duty"].includes(type)) {
    res.status(400).json(new ApiResponse(400, [], "Invalid photo type"));
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
  const { startDate } = req.query;

  if (!startDate) {
    res.status(400).json(new ApiResponse(400, [], "Start date is required"));
    throw new ApiError(400, "Start date and end date are required");
  }

  const photos = await Photo.find({
    timestamp: {
      $gte: new Date(startDate),
    },
  })
    .sort({ timestamp: -1 })
    .populate({
      path: "user",
      select: "fullName", // Select only the fullName of the user
      populate: {
        path: "organization",
        select: "name", // Select only the name of the organization
      },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});

const getUserPhotosByDateRange = asyncHandler(async (req, res) => {
  const { startDate } = req.query;

  if (!startDate) {
    res.status(400).json(new ApiResponse(400, [], "Start date is required"));
    throw new ApiError(400, "Start date and end date are required");
  }

  const photos = await Photo.find({
    user: req.user._id,

    timestamp: {
      $gte: new Date(startDate),
    },
  })
    .sort({ timestamp: -1 })
    .populate({
      path: "user",
      select: "fullName", // Select only the fullName of the user
      populate: {
        path: "organization",
        select: "name", // Select only the name of the organization
      },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, photos, "Photos retrieved successfully"));
});

export {
  uploadPhoto,
  getSinglePhoto,
  getUserPhotos,
  getPhotosByType,
  getPhotosByDateRange,
  getAllPhotos,
  getUserPhotosByDateRange,
};
