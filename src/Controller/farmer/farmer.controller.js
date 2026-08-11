import mongoose from 'mongoose';
import { FarmerRequest } from '../models/farmerRequest.model.js';
import User from '../models/user.model.js';

// ======================================================
// GET MY FARMER PROFILE
// GET /api/farmer/me
// ======================================================

export const getMyFarmerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const farmerRequest = await FarmerRequest.findOne({
      userId,
      status: 'approved',
    }).populate('userId', 'fullName email role avatar');

    if (!farmerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approved farmer profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Farmer profile retrieved successfully',
      data: {
        user: farmerRequest.userId,

        farm: {
          farmName: farmerRequest.farmName,
          farmDescription: farmerRequest.farmDescription,
          location: farmerRequest.location,
          farmSize: farmerRequest.farmSize,
          crops: farmerRequest.crops,
          farmImages: farmerRequest.farmImages,
        },

        status: farmerRequest.status,
        approvedAt: farmerRequest.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer profile',
    });
  }
};