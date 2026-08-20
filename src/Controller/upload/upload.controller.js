import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { cloudinaryService } from '../../services/storage/storage.interface.js';
import { validateImageFile } from '../../validators/upload.validator.js';
import { User } from '../../model/user.model.js';

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "No image file provided. Use the field name 'avatar'."
    );
  }

  validateImageFile(req.file);

  const { url, publicId } = await cloudinaryService.uploadFile({
    file: req.file,
    folder: 'avatars',
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url, publicId } },
    { new: true, runValidators: false }
  ).select('fullName email avatar');

  if (!updatedUser) {
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

export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "No image file provided. Use the field name 'avatar'."
    );
  }

  validateImageFile(req.file);

  const user = await User.findById(req.user._id).select('avatar');
  if (!user) throw new ApiError(404, 'User not found.');

  const oldPublicId = user.avatar?.publicId ?? null;

  const { url, publicId } = await cloudinaryService.updateFile({
    file: req.file,
    oldPublicId,
    folder: 'avatars',
  });

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

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('avatar');
  if (!user) throw new ApiError(404, 'User not found.');

  if (!user.avatar?.publicId) {
    throw new ApiError(400, 'No profile image exists for this user.');
  }

  await cloudinaryService.deleteFile(user.avatar.publicId);

  // FIXED: Use $set to reset to default shape instead of $unset
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: { url: null, publicId: null } } },
    { runValidators: false }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Profile image deleted successfully.'));
});