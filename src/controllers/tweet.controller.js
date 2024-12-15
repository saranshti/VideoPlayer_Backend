import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Tweet from "../models/Tweet.js";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Feilds are required");
  }
};

// createTweet function
const createTweet = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { content } = req.body;

  // Validate required fields
  validateFields([content]);

  // Check if postImage is uploaded
  const postImageLocalPath = req?.files?.postImage?.[0]?.path;

  if (postImageLocalPath) {
    // Upload postImage to Cloudinary
    const postImage = await uploadOnCloudinary(postImageLocalPath);

    if (!postImage) {
      throw new ApiError(400, "Post Image upload failed.");
    }
  }

  // Create the Tweet document in DB
  const tweet = await Tweet.create({
    content,
    postIamge: postImageLocalPath || "",
    owner: user_id,
  });

  // Fetch the created tweet to ensure it's correct
  const createdTweet = await Tweet.findById(tweet._id);

  if (!createdTweet) {
    throw new ApiError(500, "Internal server error while Tweeting.");
  }

  // Return the response
  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweeted successfully."));
});

// Fetch Tweets by current user
const getCurrentUserTweets = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;
  // Validate required fields
  validateFields([user_id]);

  const tweets = await Tweet.find({ owner: user_id });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

// Update Tweet details
const updateTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;
  const { content } = req.body;

  // Validate required fields
  validateFields([content, tweetId]);

  // Update tweet document
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully."));
});

// Delete Tweet by ID
const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;

  // Find and delete the Tweet by its _id
  const tweetIddel = await Tweet.findOneAndDelete({ _id: tweetId });

  if (!tweetIddel) {
    return res.status(404).json(new ApiResponse(404, null, "Tweet not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweetIddel, "Tweet deleted successfully"));
});

export { createTweet, getCurrentUserTweets, updateTweet, deleteTweet };
