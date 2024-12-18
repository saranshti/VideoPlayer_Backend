import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/Video.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { fileURLToPath } from "url";
import path from "path";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
};

// createVideo function
const createVideo = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { title, description, isPublished, duration } = req.body;

  // Validate required fields
  validateFields([title, description]);

  // Check if thumbnail is uploaded
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "No thumbnail image found.");
  }

  // Check if video file is uploaded
  const videoPath = req?.files?.video?.[0];
  const videoLocalPath = videoPath
    ? path.join(
        path.dirname(
          path.dirname(path.dirname(fileURLToPath(import.meta.url)))
        ),
        "./public/video/",
        videoPath.filename
      )
    : null;

  if (!videoLocalPath) {
    throw new ApiError(400, "No video file found.");
  }

  // Upload thumbnail to Cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed.");
  }

  // Create the video document in DB
  const video = await Video.create({
    title,
    thumbnail: thumbnail.url,
    videoFile: videoLocalPath,
    duration,
    description,
    isPublished,
    owner: user_id,
  });

  // Fetch the created video to ensure it's correct
  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(500, "Internal server error while uploading video.");
  }

  // Return the response
  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video uploaded successfully."));
});

// Fetch videos by current user
const getCurrentUserVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "User videos fetched successfully"));
});

// Fetch all videos
const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({});

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos fetched successfully"));
});

// Update video details
const updateVideoDetails = asyncHandler(async (req, res) => {
  const videoId = req.params.id;

  const { title, description, isPublished, duration } = req.body;

  // Update video document
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: { title, description, isPublished, duration } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully."));
});

// Delete video by ID
const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.id;

  // Find and delete the video by its _id
  const videoIddel = await Video.findOneAndDelete({ _id: videoId });

  if (!videoIddel) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoIddel, "Video deleted successfully"));
});

export {
  createVideo,
  getCurrentUserVideos,
  getAllVideos,
  updateVideoDetails,
  deleteVideo,
};
