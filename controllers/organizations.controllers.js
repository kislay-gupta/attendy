import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const registerOrganization = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can create organizations");
  }
  const {
    name,
    description,
    privilegeLeave,
    otherLeave,
    workingDays,
    morningAttendanceDeadline,
    eveningAttendanceStartTime,
    holidays,
    locationLatitude,
    locationLongitude,
  } = req.body;
  const logo = req.file?.path;

  // Validate required fields
  if (!name || !description || !logo || !workingDays) {
    res
      .status(400)
      .json(new ApiResponse(400, null, "All required fields must be provided"));
    throw new ApiError(400, "All required fields must be provided");
  }
  const latitude = Number(locationLatitude);
  const longitude = Number(locationLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    res
      .status(400)
      .json(new ApiResponse(400, null, "Organization location is required"));
    throw new ApiError(400, "Organization location is required");
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
    location: {
      latitude,
      longitude,
    },
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
  if (req.user?.role !== "ADMIN" && `${req.user?.organization}` !== id) {
    throw new ApiError(403, "Access denied");
  }

  const organization = await Organization.findById(id);
  if (!organization) {
    res.status(404).json(new ApiResponse(404, null, "Organization not found"));
    throw new ApiError(404, "Organization not found");
  }

  const users = await User.find({ organization: id }).select(
    "-refreshToken -password"
  );
  const organizationObj = organization.toObject();
  organizationObj.users = users;

  return res
    .status(200)
    .json(
      new ApiResponse(200, organizationObj, "Organization fetched successfully")
    );
});

const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (req.user?.role !== "ADMIN" && `${req.user?.organization}` !== id) {
    throw new ApiError(403, "Access denied");
  }

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
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can delete organizations");
  }

  const organization = await Organization.findByIdAndDelete(id);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Organization deleted successfully"));
});

const getAllOrganizations = asyncHandler(async (req, res) => {
  const filter =
    req.user?.role === "ADMIN" ? {} : { _id: req.user?.organization };

  const organizations = await Organization.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "organization",
        as: "users",
      },
    },
    {
      $project: {
        "users.password": 0,
        "users.refreshToken": 0,
      },
    },
  ]);

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
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { organization: organizationId } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const users = await User.find({ organization: organizationId }).select(
    "-password -refreshToken"
  );
  const organizationObj = organization.toObject();
  organizationObj.users = users;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        organizationObj,
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
