import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Haversine formula to check distance between coordinates in meters
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

// Create a new task (Admin only)
const createTask = asyncHandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Access denied. Only admins can assign tasks");
  }

  const {
    title,
    description,
    assignedTo,
    locationLatitude,
    locationLongitude,
    address,
    dueDate,
  } = req.body;

  if (
    !title ||
    !assignedTo ||
    !locationLatitude ||
    !locationLongitude ||
    !address
  ) {
    throw new ApiError(
      400,
      "Title, assignedTo, coordinates, and address are required"
    );
  }

  const assignedUser = await User.findById(assignedTo);
  if (!assignedUser) {
    throw new ApiError(404, "Assigned user not found");
  }

  if (
    assignedUser.organization.toString() !== req.user.organization.toString()
  ) {
    throw new ApiError(
      400,
      "Cannot assign task to user of another organization"
    );
  }

  const task = await Task.create({
    title,
    description: description || "",
    assignedTo,
    organization: req.user.organization,
    location: {
      latitude: Number(locationLatitude),
      longitude: Number(locationLongitude),
    },
    address,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created and assigned successfully"));
});

// Retrieve tasks
const getTasks = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "ADMIN") {
    filter.organization = req.user.organization;
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
  } else {
    filter.assignedTo = req.user._id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const tasks = await Task.find(filter)
    .populate("assignedTo", "fullName email username designation avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

// Check-in to start task (Employee)
const checkInTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, checkInTime } = req.body;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required for check-in");
  }

  if (!req.file) {
    throw new ApiError(400, "Check-in photo is required");
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied. Task is not assigned to you");
  }

  if (task.status !== "ASSIGNED") {
    throw new ApiError(
      400,
      `Cannot check in. Task is already ${task.status.toLowerCase()}`
    );
  }

  // Calculate geofence distance (limit to 500 meters)
  const distance = getDistanceInMeters(
    Number(latitude),
    Number(longitude),
    task.location.latitude,
    task.location.longitude
  );

  if (distance > 500) {
    throw new ApiError(
      400,
      `You must be within 500 meters of the target location to check-in. Current distance: ${Math.round(distance)}m`
    );
  }

  task.status = "IN_PROGRESS";
  task.checkInTime = checkInTime ? new Date(checkInTime) : new Date();
  task.checkInPhoto = req.file.path;
  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Checked in to task successfully"));
});

// Complete task (Employee)
const completeTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, checkOutTime, completionNotes } = req.body;

  if (!latitude || !longitude || !completionNotes) {
    throw new ApiError(
      400,
      "Latitude, longitude, and completion notes are required"
    );
  }

  if (!req.file) {
    throw new ApiError(400, "Completion photo is required");
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied. Task is not assigned to you");
  }

  if (task.status !== "IN_PROGRESS") {
    throw new ApiError(
      400,
      `Cannot complete task. Task is not currently in progress (Current status: ${task.status})`
    );
  }

  // Calculate geofence distance (limit to 500 meters)
  const distance = getDistanceInMeters(
    Number(latitude),
    Number(longitude),
    task.location.latitude,
    task.location.longitude
  );

  if (distance > 500) {
    throw new ApiError(
      400,
      `You must be within 500 meters of the target location to complete the task. Current distance: ${Math.round(distance)}m`
    );
  }

  task.status = "COMPLETED";
  task.checkOutTime = checkOutTime ? new Date(checkOutTime) : new Date();
  task.checkOutPhoto = req.file.path;
  task.completionNotes = completionNotes;
  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task marked as completed successfully"));
});

// Delete task (Admin only)
const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Access denied. Only admins can delete tasks");
  }

  const { id } = req.params;
  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.organization.toString() !== req.user.organization.toString()) {
    throw new ApiError(
      403,
      "Access denied. Task belongs to another organization"
    );
  }

  await Task.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

export { createTask, getTasks, checkInTask, completeTask, deleteTask };
