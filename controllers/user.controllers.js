import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/ngo.model.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Invalid User Id");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    password,
    email,
    mobileNo,
    deviceModel,
    deviceManufacture,
    designation,
    organization,
  } = req.body;
  if (
    [
      fullName,
      password,
      email,
      mobileNo,
      deviceModel,
      deviceManufacture,
      designation,
      organization,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { mobileNo }],
  });
  if (existedUser) {
    res
      .status(409)
      .json(
        new ApiResponse(409, {}, "User with email or mobile already exists")
      );
    throw new ApiError(409, "User with email or mobile already exists");
  }
  const avatar = req.file?.path;
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const org = Organization.findById(organization);
  if (!org) {
    throw new ApiError(404, "NGO Not found");
  }
  const createdUserName = fullName.slice(0, 2) + mobileNo.slice(8, 10);
  try {
    const user = await User.create({
      username: createdUserName,
      fullName,
      avatar,
      email,
      password,
      mobileNo,
      designation,
      organization,
      deviceInfo: {
        deviceModel,
        deviceManufacture,
      },
    });
    const createdUser = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate("organization");
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }
    const org = await Organization.findByIdAndUpdate(
      organization,
      { $addToSet: { users: user._id } },
      { new: true }
    );
    if (!org) {
      throw new ApiError(404, "NGO Not found");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while registering the user",
      []
    );
  }
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -refreshToken")
    .populate("organization");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user details"));
});

const getCurrentUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .populate("organization", "_id name");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user details"));
});

const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find({ role: "USER" })
    .select("-password -refreshToken")
    .populate("organization");
  return res.status(200).json(new ApiResponse(200, user, " all user details"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { mobileNo, password } = req.body;
  if (!mobileNo || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ mobileNo });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .populate("organization");
  if (!loggedInUser) {
    throw new ApiError(400, "Failed to login the user");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accessToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const verifyDevice = asyncHandler(async (req, res) => {
  const { deviceModel, deviceManufacture } = req.body;
  if (!deviceModel || !deviceManufacture) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        isVerified: true,
        deviceInfo: {
          deviceModel,
          deviceManufacture,
        },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(400, "Device not verified");
  }
  if (user) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Device verified successfully"));
  }
});

const verifySession = asyncHandler(async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ authenticated: true, user: decoded });
  } catch (error) {
    return res.status(402).json({ authenticated: false });
  }
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  getCurrentUserById,
  getAllUser,
  verifySession,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  verifyDevice,
};
