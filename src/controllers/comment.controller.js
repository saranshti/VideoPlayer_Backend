import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Comment from "../models/Comment.js";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Feilds are required");
  }
};

// createComment function
const createComment = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { content, videoId } = req.body;

  // Validate required fields
  validateFields([content, videoId]);

  // Create the Comment document in DB
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: user_id,
  });

  // Fetch the created video to ensure it's correct
  const createdComment = await Comment.findById(comment._id);

  if (!createdComment) {
    throw new ApiError(500, "Internal server error while Commenting.");
  }

  // Return the response
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdComment, "Video Commented successfully.")
    );
});

// Fetch Comments by current video
const getCurrentVideoComments = asyncHandler(async (req, res) => {
  const videoId = req?.params?.id;
  // Validate required fields
  validateFields([videoId]);

  const comments = await Comment.find({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// Update Comment details
const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;

  // Validate required fields
  validateFields([content, commentId]);

  // Update comment document
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully."));
});

// Delete Comment by ID
const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;

  // Find and delete the Comment by its _id
  const commentIddel = await Comment.findOneAndDelete({ _id: commentId });

  if (!commentIddel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Comment not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentIddel, "Comment deleted successfully"));
});

export { createComment, getCurrentVideoComments, updateComment, deleteComment };
