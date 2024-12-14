import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const ORIGIN = process.env.ORIGIN;
export const MONGO_URI = process.env.MONGO_URI;
export const SECRET_KEY = process.env.SECRET_KEY;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFERESH_TOKEN_SECRET = process.env.REFERESH_TOKEN_SECRET;
export const REFERESH_TOKEN_EXPIRY = process.env.REFERESH_TOKEN_EXPIRY;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
