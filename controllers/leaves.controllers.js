import { Leave } from "../models/leave.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Apply for a leave request
const createLeaveRequest = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    throw new ApiError(
      400,
      "All fields (leaveType, startDate, endDate, reason) are required"
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  // Check for existing overlapping leaves that are approved or pending
  const overlappingLeave = await Leave.findOne({
    user: req.user._id,
    status: { $in: ["PENDING", "APPROVED"] },
    $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
  });

  if (overlappingLeave) {
    throw new ApiError(
      400,
      "You already have a pending or approved leave during this period"
    );
  }

  const leave = await Leave.create({
    user: req.user._id,
    organization: req.user.organization,
    leaveType,
    startDate: start,
    endDate: end,
    reason,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, leave, "Leave request submitted successfully"));
});

// Retrieve leaves list
const getLeaves = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "ADMIN") {
    filter.organization = req.user.organization;
    // Admins can filter by specific user if provided
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
  } else {
    // Regular employees can only see their own leaves
    filter.user = req.user._id;
  }

  // Optional status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const leaves = await Leave.find(filter)
    .populate("user", "fullName email username designation avatar")
    .populate("approvedBy", "fullName designation")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, leaves, "Leaves retrieved successfully"));
});

// Approve/Reject a leave request (Admin only)
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (req.user.role !== "ADMIN") {
    throw new ApiError(
      403,
      "Access denied. Only admins can update leave status"
    );
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be APPROVED or REJECTED");
  }

  const leave = await Leave.findById(id);
  if (!leave) {
    throw new ApiError(404, "Leave request not found");
  }

  if (leave.organization.toString() !== req.user.organization.toString()) {
    throw new ApiError(
      403,
      "Access denied. Leave belongs to another organization"
    );
  }

  if (leave.status !== "PENDING") {
    throw new ApiError(
      400,
      `This leave request has already been ${leave.status.toLowerCase()}`
    );
  }

  leave.status = status;
  leave.remarks = remarks || "";
  leave.approvedBy = req.user._id;
  await leave.save();

  // If approved, deduct leave balance for the user
  if (status === "APPROVED") {
    const user = await User.findById(leave.user);
    if (user && user.leaves) {
      // Calculate duration in days
      const diffTime = Math.abs(leave.endDate - leave.startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (leave.leaveType === "Privilege") {
        user.leaves.privilegeLeave = Math.max(
          0,
          (user.leaves.privilegeLeave || 0) - diffDays
        );
      } else {
        user.leaves.otherLeave = Math.max(
          0,
          (user.leaves.otherLeave || 0) - diffDays
        );
      }
      await user.save({ validateBeforeSave: false });
    }
  }

  const updatedLeave = await Leave.findById(id)
    .populate("user", "fullName email")
    .populate("approvedBy", "fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedLeave,
        `Leave request ${status.toLowerCase()} successfully`
      )
    );
});

// Get current user's leave balances
const getLeaveBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("leaves");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle case where user leaves object doesn't exist
  const balances = {
    privilegeLeave: user.leaves?.privilegeLeave ?? 0,
    otherLeave: user.leaves?.otherLeave ?? 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, balances, "Leave balance retrieved successfully")
    );
});

export { createLeaveRequest, getLeaves, updateLeaveStatus, getLeaveBalance };
