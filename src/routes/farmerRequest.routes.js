import express from "express";

import {
  verifyJWT,
  isUser,
} from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createFarmerRequestController,
} from "../Controller/farmerRequest/farmerRequest.controller.js";

import {
  createFarmerRequestSchema,
} from "../validators/farmerRequest.validator.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  isUser,
  validate(createFarmerRequestSchema),
  createFarmerRequestController,
);

export { router as farmerRequestRoutes };