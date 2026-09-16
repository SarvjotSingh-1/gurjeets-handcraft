import { Router } from 'express';
import { getAllCategories } from '../controllers/category.controller.js';

const router = Router();

// Public Categories Route
router.get('/', getAllCategories);

export default router;
