import mongoose from "mongoose";
import {
  SECRET_KEY,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFERESH_TOKEN_SECRET,
  REFERESH_TOKEN_EXPIRY,
} from "../config/env.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    avatar: { type: String },
    coverImage: { type: String },
    refreshToken: { type: String },
    password: { type: String, required: [true, "Password is Required"] }, // Adding Custom Error Message
    watchHistory: [
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

const hmac = crypto.createHmac("sha256", SECRET_KEY);

// this is event handler middleware which is just envoke before sabving data to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // this check if only password feild is nmodified then it will run otherwise not.

  // Use HMAC with SHA256 algorithm
  this.password = hmac.update(this.password).digest("hex");
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // Use HMAC with SHA256 algorithm to hash the provided password with the secret key
  const hashedPassword = hmac.update(password).digest("hex");

  // Compare the hashed password to the one stored in the database
  return hashedPassword === this.password;
};

userSchema.methods.genrateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.genrateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    REFERESH_TOKEN_SECRET,
    { expiresIn: REFERESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
