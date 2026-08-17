import mongoose from 'mongoose';

import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { FarmerRequest } from '../../model/farmerRequest.model.js';
import { Farmer } from '../../model/farmer.model.js';
import { User } from '../../model/user.model.js';

// ======================================================
// GET ALL FARMER REQUESTS
// GET /api/admin/farmer-requests
// ======================================================
export const getAllFarmerRequests = asyncHandler(async (req, res) => {
  const requests = await FarmerRequest.find()
    .populate('userId', 'fullName email role avatar')
    .populate('reviewedBy', 'fullName email')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, requests, 'Farmer requests retrieved successfully')
    );
});

// ======================================================
// GET SINGLE FARMER REQUEST
// GET /api/admin/farmer-requests/:id
// ======================================================
export const getFarmerRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid farmer request ID');
  }

  const farmerRequest = await FarmerRequest.findById(id)
    .populate('userId', 'fullName email role avatar')
    .populate('reviewedBy', 'fullName email');

  if (!farmerRequest) {
    throw new ApiError(404, 'Farmer request not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        farmerRequest,
        'Farmer request retrieved successfully'
      )
    );
});

// ======================================================
// APPROVE FARMER REQUEST
// PATCH /api/admin/farmer-requests/:id/approve
// ======================================================
export const approveFarmerRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid farmer request ID');
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      // Find farmer request
      const farmerRequest = await FarmerRequest.findById(id).session(session);
      if (!farmerRequest) {
        throw new ApiError(404, 'Farmer request not found');
      }

      // Request must still be pending
      if (farmerRequest.status !== 'pending') {
        throw new ApiError(
          400,
          `Farmer request is already ${farmerRequest.status}`
        );
      }

      // Find user
      const user = await User.findById(farmerRequest.userId).session(session);
      if (!user) {
        throw new ApiError(404, 'User associated with this request not found');
      }

      // User must still be a normal user
      if (user.role !== 'user') {
        throw new ApiError(400, `User already has role "${user.role}"`);
      }

      // Make sure Farmer profile doesn't already exist
      const existingFarmer = await Farmer.findOne({ userId: user._id }).session(
        session
      );
      if (existingFarmer) {
        throw new ApiError(409, 'Farmer profile already exists for this user');
      }

      // 1. Create Farmer profile
      const farmer = new Farmer({
        userId: user._id,
        requestId: farmerRequest._id,
        farmName: farmerRequest.farmName,
        farmDescription: farmerRequest.farmDescription,
        location: farmerRequest.location,
        farmSize: farmerRequest.farmSize,
        crops: farmerRequest.crops,
        farmImages: farmerRequest.farmImages,
        isActive: true,
      });
      await farmer.save({ session });

      // 2. Promote User to farmer
      user.role = 'farmer';
      await user.save({ session });

      // 3. Mark FarmerRequest as approved
      farmerRequest.status = 'approved';
      farmerRequest.reviewedBy = req.user._id;
      farmerRequest.reviewedAt = new Date();
      await farmerRequest.save({ session });

      result = { farmer, farmerRequest, user };
    });
  } catch (error) {
    // MongoDB duplicate key (race condition on Farmer.userId unique index)
    if (error?.code === 11000) {
      throw new ApiError(409, 'Farmer profile already exists for this user');
    }
    throw error;
  } finally {
    await session.endSession();
  }

  await result.farmer.populate('userId', 'fullName email role avatar');
  await result.farmerRequest.populate('reviewedBy', 'fullName email');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        farmer: result.farmer,
        farmerRequest: result.farmerRequest,
        user: {
          _id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
      },
      'Farmer request approved successfully'
    )
  );
});

// ======================================================
// REJECT FARMER REQUEST
// PATCH /api/admin/farmer-requests/:id/reject
// ======================================================
export const rejectFarmerRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewMessage } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid farmer request ID');
  }

  const farmerRequest = await FarmerRequest.findById(id);
  if (!farmerRequest) {
    throw new ApiError(404, 'Farmer request not found');
  }

  if (farmerRequest.status !== 'pending') {
    throw new ApiError(
      400,
      `Farmer request is already ${farmerRequest.status}`
    );
  }

  farmerRequest.status = 'rejected';
  farmerRequest.reviewedBy = req.user._id;
  farmerRequest.reviewedAt = new Date();
  farmerRequest.reviewMessage = reviewMessage || null;
  await farmerRequest.save();

  await farmerRequest.populate('reviewedBy', 'fullName email');

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        farmerRequest,
        'Farmer request rejected successfully'
      )
    );
});
