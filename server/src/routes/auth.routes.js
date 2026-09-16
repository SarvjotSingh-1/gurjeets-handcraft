import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

// Public Authentication Routes
router.post('/register', validateBody(['name', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);

// Authenticated User Profile Route
router.get('/me', verifyJWT, getCurrentUser);

export default router;
