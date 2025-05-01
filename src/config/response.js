const { z } = require("zod");

class CustomError extends Error {
  statusCode;
  constructor(message, statusCode) {
    super(message.startsWith("\n") ? "Internal Server Error" : message);
    this.statusCode = statusCode;
  }
}

const handleError = (err, res) => {
  if (err instanceof z.ZodError) {
    return errorResponse(res, err.errors.map((e) => e.message).join(", "), err, 400);
  }
  return errorResponse(res, err.message || "Internal Server Error", err, err.statusCode || 500);
};

const successResponse = (
  res,
  message = "Success",
  data = {},
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Something went wrong",
  error = null,
  statusCode = 500
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.toString() : null,
  });
};

module.exports = {
  CustomError,
  handleError,
  successResponse,
  errorResponse
}; 