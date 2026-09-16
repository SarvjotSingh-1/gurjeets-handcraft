import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'gurjeets_handcraft_artisan_jwt_key';

// In-memory fallback users cache (mirrors auth.service memory store)
export let memoryUsers = [];

export const setMemoryUsers = (users) => {
  memoryUsers = users;
};

/**
 * Verify JWT Middleware - Authenticates requests
 */
export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      throw new ApiError(401, 'Unauthorized: Access token is invalid or expired');
    }

    let user = null;
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      try {
        const userId = decoded.id || decoded._id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId).select('-password');
        }
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
        }
      } catch (dbErr) {
        // Fallback to memory store if DB query failed
      }
    }

    if (!user) {
      user = memoryUsers.find(
        (u) =>
          String(u._id) === String(decoded.id || decoded._id) ||
          (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );
    }

    // In-memory or development fallback token reconstruction
    if (!user && decoded.email) {
      user = {
        _id: decoded.id || decoded._id,
        name: decoded.name || 'Artisan User',
        email: decoded.email,
        role: decoded.role || 'customer',
        wishlist: [],
      };
    }

    if (!user) {
      throw new ApiError(401, 'Unauthorized: User account no longer exists or has been deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require Admin Middleware - Authorizes admin-only routes
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized: Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: Admin privileges required to perform this action'));
  }

  next();
};

/**
 * Optional JWT Middleware - Attaches user if present without blocking
 */
export const optionalJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const userId = decoded.id || decoded._id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId).select('-password');
        }
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
        }
      } catch (err) {}
    }

    if (!user) {
      user = memoryUsers.find(
        (u) =>
          String(u._id) === String(decoded.id || decoded._id) ||
          (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );
    }

    if (!user && decoded.email) {
      user = {
        _id: decoded.id || decoded._id,
        name: decoded.name || 'Artisan User',
        email: decoded.email,
        role: decoded.role || 'customer',
        wishlist: [],
      };
    }

    req.user = user;
  } catch (err) {
    // Ignore invalid optional tokens
  }

  next();
};
