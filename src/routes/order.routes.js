import express from "express";
import { verifyJWT, isFarmer } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderSchema } from "../validators/order.validator.js";
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
} from "../Controller/order/order.controller.js";

const router = express.Router();

router.post("/", verifyJWT, validate(createOrderSchema), createOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/farmer/orders", verifyJWT, isFarmer, getFarmerOrders);

export { router as orderRoutes };
