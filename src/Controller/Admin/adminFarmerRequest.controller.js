import mongoose from 'mongoose';

import FarmerRequest from '../models/farmerRequest.model.js';
import User from '../models/user.model.js';


// ======================================================
// GET ALL FARMER REQUESTS
// GET /api/admin/farmer-requests
// ======================================================

export const getAllFarmerRequests = async (req, res) => {
  try {
    const requests = await FarmerRequest.find()
      .populate('userId', 'fullName email role avatar')
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
      .populate('userId', 'fullName email role avatar');

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
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer request ID',
      });
    }

    const farmerRequest = await FarmerRequest.findById(id);

    if (!farmerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Farmer request not found',
      });
    }

    // Request must still be pending
    if (farmerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Farmer request is already ${farmerRequest.status}`,
      });
    }

    const user = await User.findById(farmerRequest.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this request not found',
      });
    }

    // User should still be a normal user
    if (user.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: `User already has role "${user.role}"`,
      });
    }

    // ---------------------------------------------
    // Approve request
    // ---------------------------------------------

    farmerRequest.status = 'approved';
    farmerRequest.reviewedBy = req.user._id;
    farmerRequest.reviewedAt = new Date();

    // ---------------------------------------------
    // Promote user to farmer
    // ---------------------------------------------

    user.role = 'farmer';

    await farmerRequest.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Farmer request approved successfully',
      data: {
        farmerRequest,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Approve farmer request error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to approve farmer request',
    });
  }
};


// ======================================================
// REJECT FARMER REQUEST
// PATCH /api/admin/farmer-requests/:id/reject
// ======================================================

export const rejectFarmerRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const { reviewMessage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer request ID',
      });
    }

    const farmerRequest = await FarmerRequest.findById(id);

    if (!farmerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Farmer request not found',
      });
    }

    if (farmerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Farmer request is already ${farmerRequest.status}`,
      });
    }

    farmerRequest.status = 'rejected';
    farmerRequest.reviewedBy = req.user._id;
    farmerRequest.reviewedAt = new Date();
    farmerRequest.reviewMessage = reviewMessage || null;

    await farmerRequest.save();

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