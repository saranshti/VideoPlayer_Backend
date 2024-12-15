import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: { type: String, required: true },
    thumbnail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String },
    views: { type: Number, default: 0 }, // Adding Default Value
    isPublished: { type: Boolean, default: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // Single reference to the User model
      ref: "User", // Reference to the 'User' model
      required: true, // Ensure owner is always provided
    },
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt
  }
);

videoSchema.plugin(aggregatePaginate); // Mongoose Middleware for pagination //A page based custom aggregate pagination library for Mongoose with customizable labels.

const Video = mongoose.model("Video", videoSchema);

export default Video;
