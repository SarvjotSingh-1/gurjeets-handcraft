import { ApiError } from '../utils/ApiError.js';

/**
 * Higher-order middleware function to validate request body against required fields
 * @param {Array<string>} requiredFields - List of required field keys
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        (typeof req.body[field] === 'string' && req.body[field].trim() === '')
      ) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(
        new ApiError(
          400,
          `Validation failed: Missing required fields (${missing.join(', ')})`,
          missing.map((f) => ({ field: f, message: `${f} is required` }))
        )
      );
    }

    next();
  };
};

/**
 * Validates review submission payload
 */
export const validateReview = (req, res, next) => {
  const { rating, comment, userName } = req.body;
  const errors = [];

  if (!userName && !req.user) {
    errors.push({ field: 'userName', message: 'Reviewer name is required' });
  }

  const numRating = Number(rating);
  if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.push({ field: 'rating', message: 'Rating must be an integer between 1 and 5' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
    errors.push({
      field: 'comment',
      message: 'Review comment must be at least 5 characters long',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Invalid review payload', errors));
  }

  next();
};
