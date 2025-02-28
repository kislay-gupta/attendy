import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

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
  } = req.body;
  if (
    [fullName, password, email, mobileNo, deviceModel, deviceManufacture].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { mobileNo }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or mobile already exists");
  }
  const avatar = req.file?.path;
  const createdUserName = fullName.slice(0, 2) + mobileNo.slice(8, 10);
  try {
    const user = await User.create({
      username: createdUserName,
      fullName,
      avatar,
      email,
      password,
      mobileNo,
      deviceInfo: {
        deviceModel,
        deviceManufacture,
      },
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
});

export { registerUser };
