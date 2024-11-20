const ErrorHandler = require("../utilis/ErrorHandler");

const commonErrors = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Handle Wrong MongoDB URI Error
  if (err.name === "MongoNetworkError") {
    error = new ErrorHandler("Failed to connect to MongoDB", 500);
  }

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    error = new ErrorHandler(`Duplicate field value: ${field} already exists`, 400);
  }

  // Handle Wrong JWT Error
  if (err.name === "JsonWebTokenError") {
    error = new ErrorHandler("Invalid token, please log in again", 401);
  }

  // Handle Expired JWT Error
  if (err.name === "TokenExpiredError") {
    error = new ErrorHandler("Token has expired, please log in again", 401);
  }

  // Send the response with the appropriate error message and status
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = commonErrors;
