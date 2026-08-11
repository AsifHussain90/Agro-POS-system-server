/*
 * upload.controller.js
 *
 * Profile-image upload handlers.
 * All images go directly to Cloudinary — nothing is written to the local filesystem.
 * The Cloudinary URL and publicId are persisted to the authenticated user's document.
 *
 * Endpoints:
 *   POST   /api/upload/profile-image  → uploadProfileImage
 *   PUT    /api/upload/profile-image  → updateProfileImage
 *   DELETE /api/upload/profile-image  → deleteProfileImage
 */

import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { cloudinaryService } from '../../services/storage/storage.interface.js';
import { validateImageFile } from '../../validators/upload.validator.js';
import { User } from '../../model/user.model.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload/profile-image
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Upload a profile image for the authenticated user.
 *
 * - Accepts a single image via Multer (field name: "avatar").
 * - Uploads the buffer directly to Cloudinary (no local file written).
 * - Saves the returned URL + publicId to the user document in MongoDB.
 * - Returns the Cloudinary image URL.
 */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "No image file provided. Use the field name 'avatar'."
    );
  }

  // Validate MIME type and size
  validateImageFile(req.file);

  // Upload buffer → Cloudinary
  const { url, publicId } = await cloudinaryService.uploadFile({
    file: req.file,
    folder: 'avatars',
  });

  // Persist to DB
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url, publicId } },
    { new: true, runValidators: false }
  ).select('fullName email avatar');

  if (!updatedUser) {
    // Cleanup the newly uploaded image so Cloudinary stays clean
    await cloudinaryService.deleteFile(publicId).catch(() => {});
    throw new ApiError(404, 'User not found.');
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { imageUrl: url, user: updatedUser },
        'Profile image uploaded successfully.'
      )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/upload/profile-image
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Replace the authenticated user's profile image with a new one.
 *
 * Flow:
 *  1. Validate the incoming file.
 *  2. Upload the new image to Cloudinary.
 *  3. Delete the OLD image from Cloudinary (if one exists) — prevents orphans.
 *  4. Update the user document with the new URL + publicId.
 */
export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "No image file provided. Use the field name 'avatar'."
    );
  }

  // Validate MIME type and size
  validateImageFile(req.file);

  // Fetch current avatar publicId for cleanup
  const user = await User.findById(req.user._id).select('avatar');
  if (!user) throw new ApiError(404, 'User not found.');

  const oldPublicId = user.avatar?.publicId ?? null;

  // Upload new → then delete old (handled inside updateFile)
  const { url, publicId } = await cloudinaryService.updateFile({
    file: req.file,
    oldPublicId,
    folder: 'avatars',
  });

  // Persist new URL to DB
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url, publicId } },
    { new: true, runValidators: false }
  ).select('fullName email avatar');

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { imageUrl: url, user: updatedUser },
        'Profile image updated successfully.'
      )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/upload/profile-image
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Delete the authenticated user's profile image.
 *
 * - Removes the image from Cloudinary (no orphan left behind).
 * - Clears the avatar field in MongoDB.
 */
export const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('avatar');
  if (!user) throw new ApiError(404, 'User not found.');

  if (!user.avatar?.publicId) {
    throw new ApiError(400, 'No profile image exists for this user.');
  }

  // Delete from Cloudinary
  await cloudinaryService.deleteFile(user.avatar.publicId);

  // Clear from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { avatar: '' } },
    { runValidators: false }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Profile image deleted successfully.'));
});
