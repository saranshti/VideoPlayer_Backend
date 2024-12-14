import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";
import { logger } from "./logger.js";

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info(`MongoDB Connected!`);
  } catch (err) {
    if (retries === 0) {
      logger.error(`Error connecting to MongoDB: ${err?.message}`);
      process.exit(1); // Exit after all retries have failed
    } else {
      logger.info(`Retrying MongoDB connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000); // Retry after 5 seconds
    }
  }
};

export default connectDB;
