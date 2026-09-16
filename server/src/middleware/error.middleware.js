import { ApiError } from '../utils/ApiError.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message =
      isProduction && statusCode >= 500
        ? 'An internal server error occurred. Please try again later.'
        : error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  } else if (isProduction && error.statusCode >= 500) {
    error.message = 'An internal server error occurred. Please try again later.';
  }

  if (error.statusCode >= 500) {
    console.error(`[Server Error ${error.statusCode}]`, err);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(!isProduction && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};
