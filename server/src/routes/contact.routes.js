import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
} from '../controllers/contact.controller.js';
import { verifyJWT, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/')
  .post(submitContactMessage)
  .get(verifyJWT, requireAdmin, getContactMessages);

export default router;
