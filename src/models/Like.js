import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the 'User' model
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet", // Reference to the 'Tweet' model
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Reference to the 'Comment' model
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video", // Reference to the 'Video' model
    },
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt
  }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
