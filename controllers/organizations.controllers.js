import { Organization } from "../models/ngo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const registerOrganization = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    privilegeLeave,
    otherLeave,
    workingDays,
    morningAttendanceDeadline,
    eveningAttendanceStartTime,
    holidays,
  } = req.body;
  const logo = req.file?.path;

  // Validate required fields
  if (!name || !description || !logo || !workingDays) {
    res
      .status(400)
      .json(new ApiResponse(400, null, "All required fields must be provided"));
    throw new ApiError(400, "All required fields must be provided");
  }

  // Ensure workingDays is an array
  const processedWorkingDays = Array.isArray(workingDays)
    ? workingDays
    : workingDays.split(",").map((day) => day.trim());

  // Validate location object

  const existingOrganization = await Organization.findOne({ name });
  if (existingOrganization) {
    res
      .status(409)
      .json(
        new ApiResponse(409, null, "Organization with this name already exists")
      );
    throw new ApiError(409, "Organization with this name already exists");
  }

  const organization = await Organization.create({
    name,
    description,
    logo,
    leaves: {
      privilegeLeave,
      otherLeave,
    },
    workingDays: processedWorkingDays,
    morningAttendanceDeadline: morningAttendanceDeadline || "09:30",
    eveningAttendanceStartTime: eveningAttendanceStartTime || "17:00",
    holidays: holidays || [],
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, organization, "Organization created successfully")
    );
});

const getOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organization = await Organization.findById(id)
    .populate("users")
    .select("-refreshToken -password");
  if (!organization) {
    res.status(404).json(new ApiResponse(404, null, "Organization not found"));
    throw new ApiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, organization, "Organization fetched successfully")
    );
});

const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const organization = await Organization.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, organization, "Organization updated successfully")
    );
});

const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organization = await Organization.findByIdAndDelete(id);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Organization deleted successfully"));
});

const getAllOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find();

  return res
    .status(200)
    .json(
      new ApiResponse(200, organizations, "Organizations fetched successfully")
    );
});

const addUserToOrganization = asyncHandler(async (req, res) => {
  const { organizationId, userId } = req.body;
  if (!organizationId || !userId) {
    throw new ApiError(400, "All fields are required");
    res.status(400).json(new ApiResponse(400, null, "All fields are required"));
  }
  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { $addToSet: { users: userId } },
    { new: true }
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        organization,
        "User added to organization successfully"
      )
    );
});

export {
  registerOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getAllOrganizations,
  addUserToOrganization,
};
