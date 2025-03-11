// todo : add routes for attendance
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";

const getAttendance = asyncHandler(async (req, res) => {
  const { userId, date } = req.query;
  const attendance = await Attendance.find({ user: userId, date });
  res.status(200).json(new ApiResponse(200, attendance, "Attendance fetched"));
});

export { getAttendance };
