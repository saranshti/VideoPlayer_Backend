import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { REFERESH_TOKEN_SECRET } from "../config/env.js";

const genrateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.genrateAccessToken();
    const refreshToken = await user.genrateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Unable To Genrate a Access Token or Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user Details from frontend
  const { fullName, email, username, password } = req.body;

  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Feild Required");
  }

  // check if user already exists: username, email
  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with email or username Existed");
  }

  // check for image, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "No Avtar Image Found.");
  }

  // upload them in cloudanary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required.");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Internal Server While registering user.");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Created Successfully,"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { email, username, password } = req.body;
  // username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email requied.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User Not Exsist");
  }
  // password Check
  const isPaaswordValid = await user.isPasswordCorrect(password);
  if (!isPaaswordValid) {
    throw new ApiError(400, "Invalid Password.");
  }

  // accsess and refresh token
  const { accessToken, refreshToken } = await genrateAccessAndRefereshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send Cookie
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully!!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      REFERESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refersh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refersh Token is Expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await genrateAccessAndRefereshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "User logged In Successfully!!!"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPaaswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPaaswordValid) {
    throw new ApiError(400, "Old Password is Incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed SuccessFully!!!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetch SuccessFully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, user, "User Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avtarLocalPath = req?.file?.path;

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avatar Not Found.");
  }

  const avatar = await uploadOnCloudinary(avtarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error While uploading Avatar file.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  //TODO :- Remove old Image from the Cloudenary

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avtar Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
};
