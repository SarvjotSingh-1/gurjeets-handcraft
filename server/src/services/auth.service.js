import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { JWT_SECRET, setMemoryUsers } from '../middleware/auth.middleware.js';

// In-memory fallback user store (populated dynamically)
const memoryUsers = [];
setMemoryUsers(memoryUsers);

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate signed JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, phone = '', role = 'customer', adminSecret = '' }) => {
  if (typeof name !== 'string' || !name.trim()) throw new ApiError(400, 'Name is required and must be text');
  if (typeof email !== 'string' || !email.trim()) throw new ApiError(400, 'Email is required and must be text');
  
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, 'Invalid email address format');
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }
  if (password.length > 128) {
    throw new ApiError(400, 'Password exceeds maximum length limit of 128 characters');
  }

  // Strictly enforce admin authentication key - never grant admin by email alone
  let finalRole = 'customer';
  if (role === 'admin' || adminSecret) {
    const configuredSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;

    const validSecret = Boolean(configuredSecret && adminSecret && adminSecret.trim() === configuredSecret);
    if (!validSecret) {
      throw new ApiError(403, 'Forbidden: Invalid admin registration credentials');
    }
    finalRole = 'admin';
  }

  if (isDbConnected()) {
    try {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        throw new ApiError(409, 'An account with this email address already exists');
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: typeof phone === 'string' ? phone.trim() : '',
        role: finalRole,
      });

      const token = generateToken(user);
      const safeUser = user.toObject();
      delete safeUser.password;

      return { user: safeUser, token };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn('MongoDB user create failed, falling back to memory store:', err.message);
    }
  }

  // In-memory fallback
  const existingMem = memoryUsers.find((u) => u.email === cleanEmail);
  if (existingMem) {
    throw new ApiError(409, 'An account with this email address already exists');
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newMemUser = {
    _id: `mem_user_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    phone: typeof phone === 'string' ? phone.trim() : '',
    role: finalRole,
    wishlist: [],
    createdAt: new Date(),
  };

  memoryUsers.push(newMemUser);
  setMemoryUsers(memoryUsers);

  const token = generateToken(newMemUser);
  const safeUser = { ...newMemUser };
  delete safeUser.passwordHash;

  return { user: safeUser, token };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw new ApiError(400, 'Email and password are required and must be valid text');
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, 'Invalid email address format');
  }

  if (isDbConnected()) {
    try {
      let user = await User.findOne({ email: cleanEmail }).select('+password');

      // Auto-provision default admin in database if credentials match
      const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@gurjeetshandcraft.com').trim().toLowerCase();
      const defaultAdminPass = process.env.ADMIN_PASSWORD;

      if (!user && defaultAdminPass && cleanEmail === defaultAdminEmail && password === defaultAdminPass) {
        user = await User.create({
          name: process.env.ADMIN_NAME || 'Gurjeet',
          email: defaultAdminEmail,
          password: defaultAdminPass,
          phone: process.env.BUSINESS_PHONE || '7018183172',
          role: 'admin',
        });
        user = await User.findById(user._id).select('+password');
      }

      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          throw new ApiError(401, 'Invalid email or password');
        }

        const token = generateToken(user);
        const safeUser = user.toObject();
        delete safeUser.password;

        return { user: safeUser, token };
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn('MongoDB login lookup failed, checking memory store:', err.message);
    }
  }

  // In-memory fallback lookup
  const memUser = memoryUsers.find((u) => u.email === cleanEmail);
  if (!memUser) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = bcrypt.compareSync(password, memUser.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(memUser);
  const safeUser = { ...memUser };
  delete safeUser.passwordHash;

  return { user: safeUser, token };
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
  if (isDbConnected()) {
    try {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const user = await User.findById(userId).select('-password').populate('wishlist');
        if (user) return user;
      }
    } catch (err) {}
  }

  const memUser = memoryUsers.find((u) => String(u._id) === String(userId));
  if (!memUser) {
    throw new ApiError(404, 'User profile not found');
  }

  const safe = { ...memUser };
  delete safe.passwordHash;
  return safe;
};

/**
 * Ensure default artisan admin user exists in MongoDB
 */
export const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gurjeetshandcraft.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Gurjeet';
  const adminPhone = process.env.BUSINESS_PHONE || '7018183172';

  if (!adminPassword) {
    return;
  }

  if (isDbConnected()) {
    try {
      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        admin = await User.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          phone: adminPhone,
          role: 'admin',
        });
        console.log(`[Admin Seed] Admin account ${adminEmail} initialized in database.`);
      } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`[Admin Seed] User ${adminEmail} elevated to admin.`);
      }
    } catch (err) {
      console.warn('[Admin Seed] Notice during admin provisioning:', err.message);
    }
  }
};
