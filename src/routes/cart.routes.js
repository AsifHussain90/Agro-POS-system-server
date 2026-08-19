import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../validators/cart.validator.js';
import {
  addToCartController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  mergeCartController,
} from '../Controller/cart/cart.controller.js';

const router = express.Router();

// Optional auth: cart works for guests too
router.post('/', validate(addToCartSchema), addToCartController);
router.get('/', getCartController);
router.put('/:itemId', validate(updateCartItemSchema), updateCartItemController);
router.delete('/:itemId', removeCartItemController);
router.delete('/', clearCartController);
router.post('/merge', validate(mergeCartSchema), mergeCartController);

export { router as cartRoutes };