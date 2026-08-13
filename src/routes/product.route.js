import express from 'express';
import { verifyJWT, isFarmer } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getMyProductsController,
  updateProductController,
  deleteProductController,
} from '../Controller/product/product.controller.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator.js';

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAllProductsController);
router.get('/:id', getProductByIdController);

// ── Farmer-only routes ───────────────────────────────────────────────────────
router.use(verifyJWT, isFarmer);

router.post('/', validate(createProductSchema), createProductController);
router.get('/my-products', getMyProductsController);
router.put('/:id', validate(updateProductSchema), updateProductController);
router.delete('/:id', deleteProductController);

export { router as productRoutes };