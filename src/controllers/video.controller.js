import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/Video.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { mergeChunks } from "../utils/video.js";
import path from "path";
import fs from "fs-extra";

const uploadPath = path.join(process.cwd(), "public/video");
const uploadPathChunks = path.join(process.cwd(), "public/chunks");

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

  // Validate chunk upload parameters
  const { chunk, totalChunks, originalname } = req.body;
  if (!chunk || !totalChunks || !originalname) {
    throw new ApiError(400, "Missing chunk parameters.");
  }

  const videoFileName = originalname.replace(/\s+/g, "");

  // Handle video chunk upload and merging
  const chunkPath = path.join(
    uploadPathChunks,
    `${videoFileName}.part_${chunk}`
  );
  const videoPath = path.join(uploadPath, videoFileName);

  // Upload the current chunk
  const videoChunk = req.files?.video?.[0]; // Assuming the chunk is sent in the "video" field
  if (!videoChunk) {
    throw new ApiError(400, "No video chunk found.");
  }

  // Save the current chunk
  await fs.promises.rename(videoChunk.path, chunkPath);

  // If it's the last chunk, merge all chunks
  if (parseInt(chunk) === parseInt(totalChunks) - 1) {
    await mergeChunks(videoFileName, parseInt(totalChunks));
  }

  if (parseInt(totalChunks) - 1 > parseInt(chunk)) {
    // Return the response
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {},
          `chuck ${parseInt(chunk)} uploaded successfully.`
        )
      );
  }

  // Check if thumbnail is uploaded
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "No thumbnail image found.");
  }

  // Upload thumbnail to Cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed.");
  }
  // Create the video document in DB with path to merged video
  const video = await Video.create({
    title,
    thumbnail: thumbnail.url,
    videoFile: videoPath, // Path of merged video file
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

// Get VideoData by Id
const getVideoById = asyncHandler(async (req, res) => {
  const videos = await Video.findById(req.params.id).populate(
    "owner",
    "fullName avatar "
  ); // get only fullName and avatar from the populated owner

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// Stream Video by Id
const streamVideo = asyncHandler(async (req, res) => {
  const range = req.headers.range;
  if (!range) {
    throw new ApiError(400, "Requires Range header.");
  }
  const videoId = req.params.id;
  if (!videoId) {
    throw new ApiError(400, "Video Not Found.");
  }
  const videos = await Video.find({ _id: videoId });
  const videoPath = videos[0]?.videoFile;

  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

const viewVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  // Check if video exists
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  // Increment views atomically
  video.views += 1;

  const updatedVideo = await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video views updated successfully")
    );
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
  const videos = await Video.find({}).populate("owner", "fullName avatar ");

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
  getVideoById,
  streamVideo,
  viewVideo,
  getCurrentUserVideos,
  getAllVideos,
  updateVideoDetails,
  deleteVideo,
};
