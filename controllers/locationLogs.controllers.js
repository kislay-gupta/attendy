import { LocationLog } from "../models/locationLog.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Upload background location coordinates (single or bulk array for offline sync)
const uploadLocationLogs = asyncHandler(async (req, res) => {
  const { logs } = req.body;

  // Supports both bulk array and single object inputs
  const logsToProcess = Array.isArray(logs) ? logs : [req.body];

  if (logsToProcess.length === 0) {
    throw new ApiError(400, "No location logs provided");
  }

  // Validate and format logs
  const formattedLogs = logsToProcess.map((log) => {
    const { latitude, longitude, batteryLevel, timestamp } = log;
    if (!latitude || !longitude) {
      throw new ApiError(
        400,
        "Latitude and longitude are required for all logs"
      );
    }

    return {
      user: req.user._id,
      organization: req.user.organization,
      latitude: Number(latitude),
      longitude: Number(longitude),
      batteryLevel: batteryLevel ? Number(batteryLevel) : undefined,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };
  });

  const createdLogs = await LocationLog.insertMany(formattedLogs, {
    ordered: false,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdLogs, "Location logs uploaded successfully")
    );
});

// Retrieve location history for a specific user on a given day (Admin only or user checking themselves)
const getLocationHistory = asyncHandler(async (req, res) => {
  const { userId, date } = req.query;

  if (!userId || !date) {
    throw new ApiError(400, "User ID and Date are required");
  }

  // Authorize check
  if (req.user.role !== "ADMIN" && req.user._id.toString() !== userId) {
    throw new ApiError(
      403,
      "Access denied. Cannot view location history of another user"
    );
  }

  const queryUser = await User.findById(userId);
  if (!queryUser) {
    throw new ApiError(404, "User not found");
  }

  // Check admin organization scope
  if (
    req.user.role === "ADMIN" &&
    queryUser.organization.toString() !== req.user.organization.toString()
  ) {
    throw new ApiError(
      403,
      "Access denied. User belongs to another organization"
    );
  }

  // Define date boundary
  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const logs = await LocationLog.find({
    user: userId,
    timestamp: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .sort({ timestamp: 1 })
    .select("latitude longitude batteryLevel timestamp");

  return res
    .status(200)
    .json(
      new ApiResponse(200, logs, "Location history retrieved successfully")
    );
});

export { uploadLocationLogs, getLocationHistory };
