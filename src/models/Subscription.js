import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the 'User' model
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usser", // Reference to the 'User' model
    },
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
