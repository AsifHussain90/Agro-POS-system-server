import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  verifyJWT,
  isFarmer,
  isBuyer,
} from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderController,
  getMyOrdersController,
  getFarmerOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  trackOrderController,
} from '../Controller/orders/order.controller.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator.js';

const router = express.Router();

// Public tracking with rate limit
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many tracking attempts, please try again later.' },
});

router.get('/track', trackLimiter, trackOrderController);

// Protected routes
router.use(verifyJWT);

router.post('/', isBuyer, validate(createOrderSchema), createOrderController);
router.get('/my-orders', isBuyer, getMyOrdersController);
router.get('/farmer-orders', isFarmer, getFarmerOrdersController);
router.get('/:id', getOrderByIdController);
router.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  updateOrderStatusController
);

export { router as orderRoutes };
