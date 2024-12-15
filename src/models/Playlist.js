import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the 'Video' model
    },
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

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
