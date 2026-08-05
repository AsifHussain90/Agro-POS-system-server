/*
 * upload.routes.js
 *
 * Profile-image routes — all protected by JWT authentication.
 *
 * POST   /api/upload/profile-image  → upload a new profile picture
 * PUT    /api/upload/profile-image  → replace the existing profile picture
 * DELETE /api/upload/profile-image  → remove the profile picture
 */

import express from "express";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadProfileImage,
  updateProfileImage,
  deleteProfileImage,
} from "../Controller/upload/upload.controller.js";

const router = express.Router();

// All upload routes require a valid access token
router.use(verifyJWT);

// Upload a profile image (no existing image required)
router.post("/profile-image", uploadSingle("avatar"), uploadProfileImage);

// Replace the current profile image with a new one
router.put("/profile-image", uploadSingle("avatar"), updateProfileImage);

// Delete the current profile image
router.delete("/profile-image", deleteProfileImage);

export { router as uploadRoutes };
