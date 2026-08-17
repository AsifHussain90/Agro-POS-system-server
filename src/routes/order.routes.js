import express from 'express';
import { verifyJWT, isFarmer } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderController,
  getMyOrdersController,
  getFarmerOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from '../Controller/orders/order.controller.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator.js';

const router = express.Router();

// All order routes require authentication
router.use(verifyJWT);

// ── Buyer routes ─────────────────────────────────────────────────────────────
router.post('/', validate(createOrderSchema), createOrderController);
router.get('/my-orders', getMyOrdersController);

// ── Shared routes (buyer or farmer can access own order) ─────────────────────
router.get('/:id', getOrderByIdController);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatusController);

// ── Farmer routes ────────────────────────────────────────────────────────────
router.get('/farmer-orders', isFarmer, getFarmerOrdersController);

export { router as orderRoutes };