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

// ── Public: list all products ────────────────────────────────────────────────
router.get('/', getAllProductsController);

// ── Farmer-only: must be registered before the public GET /:id below ────────
router.get('/my-products', verifyJWT, isFarmer, getMyProductsController);
router.post('/', verifyJWT, isFarmer, validate(createProductSchema), createProductController);
router.put('/:id', verifyJWT, isFarmer, validate(updateProductSchema), updateProductController);
router.delete('/:id', verifyJWT, isFarmer, deleteProductController);

// ── Public: get a single product (registered last so it can't shadow /my-products) ──
router.get('/:id', getProductByIdController);

export { router as productRoutes };