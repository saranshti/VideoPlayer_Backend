import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Playlist from "../models/Playlist.js";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Feilds are required");
  }
};

// createPlaylist function
const createPlaylist = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { name, description } = req.body;

  // Validate required fields
  validateFields([name, description]);

  // Create the Playlist document in DB
  const playlist = await Playlist.create({
    name,
    description,
    owner: user_id,
  });

  // Fetch the created video to ensure it's correct
  const createdplaylist = await Playlist.findById(playlist._id);

  if (!createdplaylist) {
    throw new ApiError(500, "Internal server error while playlisting.");
  }

  // Return the response
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdplaylist, "Video playlisted successfully.")
    );
});

// Fetch playlists by current user
const getAllPlaylist = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  // Validate required fields
  validateFields([userId]);

  const playlists = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

// Fetch Current playlists by current user
const getCurrentPlayist = asyncHandler(async (req, res) => {
  const playlistId = req?.params?.id;
  // Validate required fields
  validateFields([playlistId]);

  const playlist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

// Add Videos in playlist
const addVideos = asyncHandler(async (req, res) => {
  const playlistId = req?.params?.id;
  const videos = req?.video;
  // Validate required fields
  validateFields([playlistId]);

  if (videos?.length <= 0) {
    throw new ApiError(400, "No Video Found.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  await Playlist.updateOne(
    { _id: playlistId },
    { $addToSet: { video: { $each: videos } } } // addToSet help to add only unique videos
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist Updated successfully"));
});

// remove Videos in playlist
const removeVideos = asyncHandler(async (req, res) => {
  const playlistId = req?.params?.id;
  const videos = req?.video;
  // Validate required fields
  if (videos?.length <= 0) {
    throw new ApiError(400, "No Video Found.");
  }
  validateFields([playlistId]);

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  await Playlist.updateOne(
    { _id: playlistId },
    {
      $pull: {
        video: { $in: videosToRemove }, // Array of video IDs
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist Updated successfully"));
});

// Update Playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.id;
  const { name, description } = req.body;

  // Validate required fields
  validateFields([name, description, playlistId]);

  // Update playlist document
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: { name, description } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully."));
});

// Delete Playlist by ID
const deletePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.id;

  // Find and delete the Playlist by its _id
  const playlistIddel = await Playlist.findOneAndDelete({ _id: playlistId });

  if (!playlistIddel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Playlist not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlistIddel, "Playlist deleted successfully"));
});

export {
  createPlaylist,
  addVideos,
  removeVideos,
  getCurrentPlayist,
  getAllPlaylist,
  updatePlaylist,
  deletePlaylist,
};
