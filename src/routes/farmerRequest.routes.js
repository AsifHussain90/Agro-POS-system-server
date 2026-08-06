import express from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFarmerRequestController,
  getMyFarmerRequestsController,
  updateFarmerRequestController,
  deleteFarmerRequestController,
  getAllFarmerRequestsController,
  getFarmerRequestByIdController,
  approveFarmerRequestController,
  rejectFarmerRequestController,
} from "../Controller/farmerRequest/farmerRequest.controller.js";
import {
  createFarmerRequestSchema,
  updateFarmerRequestSchema,
  reviewFarmerRequestSchema,
} from "../validators/farmerRequest.validator.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  validate(createFarmerRequestSchema),
  createFarmerRequestController,
);
router.get("/me", verifyJWT, getMyFarmerRequestsController);
router.put(
  "/",
  verifyJWT,
  validate(updateFarmerRequestSchema),
  updateFarmerRequestController,
);
router.delete("/", verifyJWT, deleteFarmerRequestController);

router.get(
  "/admin/farmer-requests",
  verifyJWT,
  isAdmin,
  getAllFarmerRequestsController,
);
router.get(
  "/admin/farmer-requests/:id",
  verifyJWT,
  isAdmin,
  getFarmerRequestByIdController,
);
router.patch(
  "/admin/farmer-requests/:id/approve",
  verifyJWT,
  isAdmin,
  validate(reviewFarmerRequestSchema),
  approveFarmerRequestController,
);
router.patch(
  "/admin/farmer-requests/:id/reject",
  verifyJWT,
  isAdmin,
  validate(reviewFarmerRequestSchema),
  rejectFarmerRequestController,
);

export { router as farmerRequestRoutes };
