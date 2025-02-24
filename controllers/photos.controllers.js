import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
const uploadPhoto = asyncHandler(async (req, res) => {
  try {
    const userFile = req.file;
    console.log(userFile);
    res
      .status(200)
      .json(new ApiResponse(200, userFile, "Photo uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, "failed to upload the file");
  }
});
export { uploadPhoto };
