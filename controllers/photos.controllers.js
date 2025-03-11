import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Photo } from "../models/photo.model.js";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
const uploadPhoto = asyncHandler(async (req, res) => {
  const { latitude, longitude, photoType, timestamp, address } = req.body;

  // Convert Unix timestamp to Date object
  const photoDate = new Date(Number(timestamp));

  if (!latitude || !longitude || !photoType) {
    throw new ApiError(400, "Latitude, longitude and photoType are required");
  }
  console.log(address);
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
      timestamp: photoDate,
      address,
      user: req.user._id,
    });

    if (photoType === "Punch In") {
      try {
        const user = await User.findById(req.user._id).populate("organization");
        const org = user.organization;

        const [deadlineHours, deadlineMinutes] = org.morningAttendanceDeadline
          .split(":")
          .map(Number);

        // Create deadline date using the same day as photo
        const attendanceDate = new Date(photoDate);
        attendanceDate.setHours(deadlineHours, deadlineMinutes, 0, 0);

        // Calculate grace period end (15 mins after deadline)
        const gracePeriodEnd = new Date(
          attendanceDate.getTime() + 15 * 60 * 1000
        );

        // Determine status
        let status = "ABSENT";
        if (photoDate <= attendanceDate) {
          status = "PRESENT";
        } else if (photoDate <= gracePeriodEnd) {
          status = "LATE";
        }

        await Attendance.findOneAndUpdate(
          { user: user._id, date: attendanceDate },
          {
            $set: {
              checkInTime: photoDate,
              checkInPhoto: req.file.path,
              checkInLocation: { latitude, longitude },
              organization: org._id,
              status,
              date: attendanceDate,
              user: user._id,
            },
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("Attendance update error:", error);
      }
    }

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
  const { type, userId, startDate } = req.query;

  if (!["Punch In", "Punch Out", "Duty"].includes(type)) {
    throw new ApiError(400, "Invalid photo type");
  }

  if (!userId || !startDate) {
    throw new ApiError(400, "User ID and start date are required");
  }
  const queryDate = new Date(startDate);
  // Set end of day time (23:59:59.999)
  const endDate = new Date(queryDate);
  endDate.setHours(23, 59, 59, 999);
  const photos = await Photo.find({
    user: userId,
    photoType: type,
    timestamp: {
      $gte: queryDate,
      $lte: endDate,
    },
  })
    .sort({ timestamp: -1 })
    .populate({
      path: "user",
      select: "fullName",
      populate: {
        path: "organization",
        select: "name",
      },
    });
  return res
    .status(200)
    .json(
      new ApiResponse(200, photos, `${type} photos retrieved successfully`)
    );
});

const getUserPhotosByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate } = req.query;

  if (!startDate) {
    res.status(400).json(new ApiResponse(400, [], "Start date is required"));
    throw new ApiError(400, "Start date and end date are required");
  }
  if (!["Punch In", "Punch Out", "Duty"].includes(type)) {
    res.status(400).json(new ApiResponse(400, [], "Invalid photo type"));
    throw new ApiError(400, "Invalid photo type");
  }

  const photos = await Photo.find({
    user: req.user._id,
    photoType: type,
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
    .json(
      new ApiResponse(200, photos, `${type} photos retrieved successfully`)
    );
});

const getPhotosByDateRange = asyncHandler(async (req, res) => {
  const { startDate, photoType } = req.query;

  if (!startDate) {
    res.status(400).json(new ApiResponse(400, [], "Start date is required"));
    throw new ApiError(400, "Start date and end date are required");
  }
  const queryDate = new Date(startDate);

  const endDate = new Date(queryDate);
  endDate.setHours(23, 59, 59, 999);
  const photos = await Photo.find({
    photoType,
    timestamp: {
      $gte: queryDate,
      $lte: endDate,
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
  const queryDate = new Date(startDate);

  const endDate = new Date(queryDate);
  endDate.setHours(23, 59, 59, 999);
  const photos = await Photo.find({
    user: req.user._id,

    timestamp: {
      $gte: queryDate,
      $lte: endDate,
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
  getUserPhotosByType,
  getUserPhotosByDateRange,
};
