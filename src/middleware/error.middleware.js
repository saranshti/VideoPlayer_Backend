import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  // If the error is an instance of ApiError, handle it specifically
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success, // Return success as false
      message: err.message, // Return the error message
      errors: err.errors, // Return any specific error details (e.g., validation errors)
      //   stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only include stack trace in dev mode
      stack: true ? err.stack : undefined, // Only include stack trace in dev mode
    });
  }

  // For unexpected errors, log them and send a generic message
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    errors: [],
  });
};
