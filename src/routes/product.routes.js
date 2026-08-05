import express from "express";
import { verifyJWT, isFarmer } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controller/product/product.controller.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post(
  "/",
  verifyJWT,
  isFarmer,
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  verifyJWT,
  isFarmer,
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", verifyJWT, isFarmer, deleteProduct);

export { router as productRoutes };
