import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { Farmer } from '../../model/farmer.model.js';

// ======================================================
// GET MY FARMER PROFILE
// GET /api/farmer/me
// ======================================================

export const getMyFarmerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const farmer = await Farmer.findOne({ userId }).populate(
    'userId',
    'fullName email role avatar'
  );

  if (!farmer) {
    throw new ApiError(404, 'Farmer profile not found');
  }

  if (!farmer.isActive) {
    throw new ApiError(403, 'Farmer account is inactive');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, farmer, 'Farmer profile retrieved successfully')
    );
});

// ======================================================
// UPDATE MY FARMER PROFILE
// PUT /api/farmer/profile
// ======================================================

export const updateMyFarmerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const farmer = await Farmer.findOne({ userId });

  if (!farmer) {
    throw new ApiError(404, 'Farmer profile not found');
  }

  if (!farmer.isActive) {
    throw new ApiError(403, 'Farmer account is inactive');
  }

  const {
    farmName,
    farmDescription,
    location,
    farmSize,
    crops,
    farmImages,
  } = req.body;

  if (farmName !== undefined) farmer.farmName = farmName;
  if (farmDescription !== undefined) farmer.farmDescription = farmDescription;
  if (location !== undefined) farmer.location = location;
  if (farmSize !== undefined) farmer.farmSize = farmSize;
  if (crops !== undefined) farmer.crops = crops;
  if (farmImages !== undefined) farmer.farmImages = farmImages;

  await farmer.save();

  await farmer.populate('userId', 'fullName email role avatar');

  return res
    .status(200)
    .json(
      new ApiResponse(200, farmer, 'Farmer profile updated successfully')
    );
});