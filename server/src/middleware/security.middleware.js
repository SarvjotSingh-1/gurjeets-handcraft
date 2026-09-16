/**
 * Security Middleware for Gurjeet's Handcraft
 * Provides:
 * 1. HTTP Security Headers
 * 2. NoSQL Query & Body Sanitization (prevents operator injection)
 * 3. In-Memory Sliding-Window Rate Limiting
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * 1. HTTP Security Headers Middleware
 * Enforces secure defaults without external bloat
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking via iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS Auditor filter (legacy protection for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Strict Transport Security (HSTS) in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Basic Content Security Policy (allows self and trusted image/font origins)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https: res.cloudinary.com images.unsplash.com; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https: http:; script-src 'self' 'unsafe-inline'; object-src 'none';"
  );

  next();
};

/**
 * 2. Deep NoSQL Injection Sanitizer
 * Recursively cleans keys starting with '$' or containing '.' from objects
 */
export const sanitizeInput = (val) => {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeInput(item));
  }

  if (typeof val === 'object' && !(val instanceof Date)) {
    const cleaned = {};
    for (const [key, value] of Object.entries(val)) {
      // Reject or strip operators like $gt, $ne, $where, or dot-notation traversal
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleaned[key] = sanitizeInput(value);
    }
    return cleaned;
  }

  return val;
};

export const sanitizeNoSql = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params);
  }
  next();
};

/**
 * 3. In-Memory Sliding-Window Rate Limiter
 * Tracks requests by client IP with auto-expiring time windows
 * 
 * @param {Object} options - { windowMs: number, max: number, message: string }
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100,
  message = 'Too many requests from this IP. Please try again later.',
}) => {
  const ipHits = new Map();

  // Periodic cleanup of stale IP records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now > record.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // In test environment, allow disabling or bypassing rate limiter if requested
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = ipHits.get(clientIp);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipHits.set(clientIp, record);
    } else {
      record.count += 1;
    }

    // Set standard rate limit headers
    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return next(new ApiError(429, message));
    }

    next();
  };
};
