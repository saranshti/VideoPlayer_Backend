import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Subscription from "../models/Subscription.js";

// Helper function to validate required fields
const validateFields = (fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All Feilds are required");
  }
};

// createSubscription function
const createSubscription = asyncHandler(async (req, res) => {
  const user_id = req?.user?._id;

  const { channel } = req.body;

  // Validate required fields
  validateFields([channel, user_id]);

  // Create the subs document in DB
  const subs = await Subscription.create({
    subscriber: user_id,
    channel,
  });

  // Fetch the created subs to ensure it's correct
  const createdSubscription = await Subscription.findById(subs._id);

  if (!createdSubscription) {
    throw new ApiError(500, "Internal server error while subscribing.");
  }

  // Return the response
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdSubscription, "Subscribed successfully.")
    );
});

// remove Subscription
const removeSubscription = asyncHandler(async (req, res) => {
  const subsId = req?.params?.id;

  validateFields([subsId]);

  const subs = await Subscription.findById(subsId);

  if (!subs) {
    throw new ApiError(404, "Subs not found.");
  }

  await Subscription.findOneAndDelete({ _id: subsId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "UnSubscribed successfully"));
});

export { createSubscription, removeSubscription };
