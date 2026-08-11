import mongoose from 'mongoose';

import { FarmerRequest } from '../models/farmerRequest.model.js';
import { Farmer } from '../models/farmer.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorHandler.js';

// GET ALL FARMER REQUESTS
// GET /api/admin/farmer-requests
// ======================================================

export const getAllFarmerRequests = async (req, res) => {
  try {
    const requests = await FarmerRequest.find()
      .populate('userId', 'fullName email role avatar')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Farmer requests retrieved successfully',
      data: requests,
    });
  } catch (error) {
    console.error('Get all farmer requests error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer requests',
    });
  }
};

// ======================================================
// GET SINGLE FARMER REQUEST
// GET /api/admin/farmer-requests/:id
// ======================================================

export const getFarmerRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer request ID',
      });
    }

    const farmerRequest = await FarmerRequest.findById(id)
      .populate('userId', 'fullName email role avatar')
      .populate('reviewedBy', 'fullName email');

    if (!farmerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Farmer request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Farmer request retrieved successfully',
      data: farmerRequest,
    });
  } catch (error) {
    console.error('Get farmer request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer request',
    });
  }
};

// ======================================================
// APPROVE FARMER REQUEST
// PATCH /api/admin/farmer-requests/:id/approve
// ======================================================

export const approveFarmerRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate request ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer request ID',
      });
    }

    let result;

    // --------------------------------------------------
    // Start transaction
    // --------------------------------------------------

    await session.withTransaction(async () => {
      // ------------------------------------------------
      // Find farmer request
      // ------------------------------------------------

      const farmerRequest = await FarmerRequest.findById(id).session(session);

      if (!farmerRequest) {
        throw new ApiError(404, 'Farmer request not found');
      }

      // ------------------------------------------------
      // Request must still be pending
      // ------------------------------------------------

      if (farmerRequest.status !== 'pending') {
        throw new ApiError(
          400,
          `Farmer request is already ${farmerRequest.status}`
        );
      }

      // ------------------------------------------------
      // Find user
      // ------------------------------------------------

      const user = await User.findById(farmerRequest.userId).session(session);

      if (!user) {
        throw new ApiError(404, 'User associated with this request not found');
      }

      // ------------------------------------------------
      // User must still be a normal user
      // ------------------------------------------------

      if (user.role !== 'user') {
        throw new ApiError(400, `User already has role "${user.role}"`);
      }

      // ------------------------------------------------
      // Make sure Farmer profile doesn't already exist
      // ------------------------------------------------

      const existingFarmer = await Farmer.findOne({
        userId: user._id,
      }).session(session);

      if (existingFarmer) {
        throw new ApiError(409, 'Farmer profile already exists for this user');
      }

      // ------------------------------------------------
      // 1. Create Farmer profile
      // ------------------------------------------------

      const farmer = new Farmer({
        userId: user._id,

        farmName: farmerRequest.farmName,

        farmDescription: farmerRequest.farmDescription,

        location: farmerRequest.location,

        farmSize: farmerRequest.farmSize,

        crops: farmerRequest.crops,

        farmImages: farmerRequest.farmImages,

        isActive: true,

        approvedAt: new Date(),
      });

      await farmer.save({ session });

      // ------------------------------------------------
      // 2. Promote User to farmer
      // ------------------------------------------------

      user.role = 'farmer';

      await user.save({ session });

      // ------------------------------------------------
      // 3. Mark FarmerRequest as approved
      // ------------------------------------------------

      farmerRequest.status = 'approved';

      farmerRequest.reviewedBy = req.user._id;

      farmerRequest.reviewedAt = new Date();

      await farmerRequest.save({ session });

      // ------------------------------------------------
      // Store result for response
      // ------------------------------------------------

      result = {
        farmer,
        farmerRequest,
        user,
      };
    });

    // --------------------------------------------------
    // Populate after transaction
    // --------------------------------------------------

    await result.farmer.populate('userId', 'fullName email role avatar');

    await result.farmerRequest.populate('reviewedBy', 'fullName email');

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Farmer request approved successfully',
      data: {
        farmer: result.farmer,

        farmerRequest: result.farmerRequest,

        user: {
          _id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    console.error('Approve farmer request error:', error);

    // Handle our ApiError
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Farmer profile already exists for this user',
      });
    }
    // Unknown error
    return res.status(500).json({
      success: false,
      message: 'Failed to approve farmer request',
    });
  } finally {
    await session.endSession();
  }
};

// REJECT FARMER REQUEST
// PATCH /api/admin/farmer-requests/:id/reject
// ====================================================
export const rejectFarmerRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const { reviewMessage } = req.body;

    // --------------------------------------------------
    // Validate ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer request ID',
      });
    }

    // --------------------------------------------------
    // Find request
    // --------------------------------------------------

    const farmerRequest = await FarmerRequest.findById(id);

    if (!farmerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Farmer request not found',
      });
    }

    // --------------------------------------------------
    // Only pending requests can be rejected
    // --------------------------------------------------

    if (farmerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Farmer request is already ${farmerRequest.status}`,
      });
    }

    // --------------------------------------------------
    // Reject request
    // --------------------------------------------------

    farmerRequest.status = 'rejected';
    farmerRequest.reviewedBy = req.user._id;
    farmerRequest.reviewedAt = new Date();
    farmerRequest.reviewMessage = reviewMessage || null;
    await farmerRequest.save();

    await farmerRequest.populate('reviewedBy', 'fullName email');

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Farmer request rejected successfully',
      data: farmerRequest,
    });
  } catch (error) {
    console.error('Reject farmer request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to reject farmer request',
    });
  }
};
