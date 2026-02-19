// todo : add routes for attendance
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";
import { ApiError } from "../utils/ApiError.js";

const getAttendance = asyncHandler(async (req, res) => {
  const { userId, organizationId } = req.query;
  if (req.user?.role !== "ADMIN" && userId && `${req.user?._id}` !== userId) {
    throw new ApiError(403, "Access denied");
  }
  const scopeOrganization =
    req.user?.role === "ADMIN" && organizationId
      ? organizationId
      : req.user?.organization;
  const attendance = await Attendance.find({
    ...(userId ? { user: userId } : {}),
    organization: scopeOrganization,
  });
  res.status(200).json(new ApiResponse(200, attendance, "Attendance fetched"));
});

export { getAttendance };
