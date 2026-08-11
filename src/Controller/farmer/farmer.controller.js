import mongoose from 'mongoose';

import { Farmer } from '../models/farmer.model.js';

// ======================================================
// GET MY FARMER PROFILE
// GET /api/farmer/me
// ======================================================

export const getMyFarmerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // --------------------------------------------------
    // Find farmer profile
    // --------------------------------------------------

    const farmer = await Farmer.findOne({
      userId,
    }).populate(
      'userId',
      'fullName email role avatar'
    );

    // --------------------------------------------------
    // Farmer profile does not exist
    // --------------------------------------------------

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    // --------------------------------------------------
    // Farmer account is inactive
    // --------------------------------------------------

    if (!farmer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Farmer account is inactive',
      });
    }

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Farmer profile retrieved successfully',
      data: farmer,
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer profile',
    });
  }
};

// ======================================================
// UPDATE MY FARMER PROFILE
// PUT /api/farmer/profile
// ======================================================

export const updateMyFarmerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // --------------------------------------------------
    // Find farmer profile
    // --------------------------------------------------

    const farmer = await Farmer.findOne({
      userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
    }

    // --------------------------------------------------
    // Farmer must be active
    // --------------------------------------------------

    if (!farmer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Farmer account is inactive',
      });
    }

    // --------------------------------------------------
    // Only allow farmer fields
    // --------------------------------------------------

    const {
      farmName,
      farmDescription,
      location,
      farmSize,
      crops,
      farmImages,
    } = req.body;

    // --------------------------------------------------
    // Update fields
    // --------------------------------------------------

    if (farmName !== undefined) {
      farmer.farmName = farmName;
    }

    if (farmDescription !== undefined) {
      farmer.farmDescription = farmDescription;
    }

    if (location !== undefined) {
      farmer.location = location;
    }

    if (farmSize !== undefined) {
      farmer.farmSize = farmSize;
    }

    if (crops !== undefined) {
      farmer.crops = crops;
    }

    if (farmImages !== undefined) {
      farmer.farmImages = farmImages;
    }

    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await farmer.save();

    // --------------------------------------------------
    // Populate user information
    // --------------------------------------------------

    await farmer.populate(
      'userId',
      'fullName email role avatar'
    );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      data: farmer,
    });
  } catch (error) {
    console.error('Update farmer profile error:', error);

    // --------------------------------------------------
    // Mongoose validation error
    // --------------------------------------------------

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update farmer profile',
    });
  }
};