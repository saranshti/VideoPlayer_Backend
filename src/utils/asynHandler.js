// Used for to handle errors if APi Fails
// Common Function to handle errors ;

// Higher-order function that handles asynchronous route handlers
const asyncHandler = (requestHandler) => {
  // Return a middleware function
  return (req, res, next) => {
    // Execute the request handler and catch any promise rejections (errors)
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      // Pass any error to the next middleware (error-handling middleware)
      next(err);
    });
  };
};

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     await requestHandler(req, res, next);
//   } catch (err) {
//     res.status(err.code || 500).json({
//       message: err.message,
//       success: false,
//     });
//   }
// };

export { asyncHandler };
