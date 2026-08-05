import express from "express";
import {
  verifyJWT,
  isAdmin,
  isFarmer,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFarmerApplication,
  getMyFarmerProfile,
  updateFarmerProfile,
  getAllFarmerRequests,
  getFarmerRequestById,
  approveFarmerRequest,
  rejectFarmerRequest,
} from "../Controller/farmer/farmer.controller.js";
import {
  createFarmerSchema,
  updateFarmerSchema,
} from "../validators/farmer.validator.js";

const router = express.Router();

router.post(
  "/apply",
  verifyJWT,
  validate(createFarmerSchema),
  createFarmerApplication,
);
router.get("/me", verifyJWT, getMyFarmerProfile);
router.put(
  "/profile",
  verifyJWT,
  isFarmer,
  validate(updateFarmerSchema),
  updateFarmerProfile,
);

router.get("/admin/farmer-requests", verifyJWT, isAdmin, getAllFarmerRequests);
router.get(
  "/admin/farmer-requests/:id",
  verifyJWT,
  isAdmin,
  getFarmerRequestById,
);
router.patch(
  "/admin/farmer-requests/:id/approve",
  verifyJWT,
  isAdmin,
  approveFarmerRequest,
);
router.patch(
  "/admin/farmer-requests/:id/reject",
  verifyJWT,
  isAdmin,
  rejectFarmerRequest,
);

export { router as farmerRoutes };
