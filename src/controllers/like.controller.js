import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Like from "../models/Like.js";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Feilds are required");
  }
};

// createLike function
const createLike = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { tweet, comment, video } = req.body;

  // Validate required fields
  validateFields([user_id]);

  // Create the like document in DB
  const like = await Like.create({
    likedBy: user_id,
    tweet,
    comment,
    video,
  });

  // Fetch the created Like to ensure it's correct
  const createdLike = await Like.findById(like._id);

  if (!createdLike) {
    throw new ApiError(500, "Internal server error while Likeing.");
  }

  // Return the response
  return res
    .status(201)
    .json(new ApiResponse(201, createdLike, "Liked successfully."));
});

// remove Like
const removeLike = asyncHandler(async (req, res) => {
  const LikeId = req?.params?.id;

  validateFields([LikeId]);

  const like = await Like.findById(LikeId);

  if (!like) {
    throw new ApiError(404, "like not found.");
  }

  await Like.findOneAndDelete({ _id: LikeId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Like Deleted successfully"));
});

export { createLike, removeLike };
