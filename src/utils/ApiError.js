// Custom error class to handle API-specific errors
export class ApiError extends Error {
  // Constructor initializes the custom error properties
  constructor(
    statusCode, // HTTP status code representing the error type (e.g., 400, 404, 500)
    message = "Something Went Wrong !!!", // Default error message if none is provided
    errors = [], // Array to hold additional error details (e.g., validation errors)
    stack = "" // Optional stack trace, if provided
  ) {
    super(message); // Call the parent Error constructor with the message

    // Set the custom properties on the error object
    this.statusCode = statusCode; // Set the HTTP status code for the error
    this.message = message; // Set the error message (either default or custom)
    this.success = false; // Always false to indicate that the operation was not successful
    this.errors = errors; // Attach any specific error details provided (e.g., validation errors)

    // If a stack trace is provided, use it; otherwise, capture the stack trace automatically
    if (stack) {
      this.stack = stack; // If stack trace is passed explicitly, use it
    } else {
      Error.captureStackTrace(this, this.constructor); // Capture the stack trace automatically
    }
  }
}
