import { Router } from 'express';
import {
  uploadProductImages,
  deleteProductImage,
} from '../controllers/upload.controller.js';
import { verifyJWT, requireAdmin } from '../middleware/auth.middleware.js';
import { uploadProductImagesMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all upload routes: Admin Only
router.use(verifyJWT, requireAdmin);

// Upload multiple product images
router.post('/images', uploadProductImagesMiddleware, uploadProductImages);

// Delete product image by publicId wildcard (supports slashes in folder/public_id)
router.delete('/images/*', deleteProductImage);
router.delete('/images', deleteProductImage);

export default router;
