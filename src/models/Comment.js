import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    owner: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the 'User' model
      },
    ],
    video: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video", // Reference to the 'Video' model
      },
    ],
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt
  }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
