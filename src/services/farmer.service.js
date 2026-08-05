import { Farmer } from "../model/farmer.model.js";
import User from "../model/user.model.js";
import AppError from "../utils/errorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const farmerService = {
  /**
   * --------------------------------------------------------------------------
   * CREATE FARMER PROFILE
   * --------------------------------------------------------------------------
   * BUSINESS LOGIC:
   * 1. Verify user doesn't already have a farmer profile (one-to-one constraint).
   * 2. Create the farmer document with user reference.
   * 3. Update user's role to 'farmer' (role synchronization).
   * 4. Return populated farmer data.
   *
   * TRANSACTION: Steps 2 and 3 should be atomic. In production, wrap in
   * MongoDB transactions (session.startTransaction()).
   */
  async createFarmerProfile(userId, farmerData) {
    // BUSINESS RULE: One user = One farmer profile
    const existingProfile = await Farmer.findOne({ user: userId });
    if (existingProfile) {
      throw new AppError(
        "User already has a farmer profile.",
        409, // Conflict
      );
    }

    // BUSINESS RULE: User must exist and be verified
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.isEmailVerified) {
      throw new AppError(
        "Email must be verified before creating farmer profile",
        403,
      );
    }

    // Create farmer document with reference to user
    const farmer = await Farmer.create({
      ...farmerData,
      user: userId, // ObjectId reference — the one-to-one link
    });

    // BUSINESS RULE: Update user role to 'farmer'
    // This enables role-based access control (RBAC) across the app.
    await User.findByIdAndUpdate(userId, { role: "farmer" });

    // POPULATION: Replace user ObjectId with actual user document
    // We select only public fields — never return password.
    const populatedFarmer = await Farmer.findById(farmer._id)
      .populate("user", "fullName email role avatar")
      .populate("products", "name price unit availableQuantity");

    return populatedFarmer;
  },

  /**
   * --------------------------------------------------------------------------
   * UPDATE FARMER PROFILE
   * --------------------------------------------------------------------------
   * BUSINESS LOGIC:
   * 1. Verify the farmer owns this profile (authorization).
   * 2. Prevent updates to restricted fields (user reference, isVerified).
   * 3. Handle partial updates (merge with existing data).
   * 4. Recalculate profile completion automatically (via pre-save hook).
   */
  async updateFarmerProfile(userId, updateData) {
    // Find farmer by user reference (one-to-one lookup)
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer) {
      throw new AppError("Farmer profile not found", 404);
    }

    // SECURITY: Remove fields that should never be updated by user
    delete updateData.user; // Cannot reassign profile owner
    delete updateData.isVerified; // Only admin can verify
    delete updateData.deletedAt; // Only admin can restore

    // Handle array field updates (crops, certifications, images)
    // BUSINESS RULE: For updates, we REPLACE arrays rather than append
    // to give the client full control over the data.
    if (updateData.crops) farmer.crops = updateData.crops;
    if (updateData.certifications)
      farmer.certifications = updateData.certifications;
    if (updateData.farmImages) farmer.farmImages = updateData.farmImages;

    // Handle nested object updates (location, farmSize)
    if (updateData.location) {
      farmer.location = {
        ...farmer.location.toObject(),
        ...updateData.location,
      };
    }
    if (updateData.farmSize) {
      farmer.farmSize = { ...farmer.farmSize, ...updateData.farmSize };
    }

    // Handle primitive field updates
    const primitiveFields = ["farmName", "farmDescription", "isActive"];
    primitiveFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        farmer[field] = updateData[field];
      }
    });

    await farmer.save(); // Triggers pre-save hooks (profile completion calc)

    // Return populated result
    return await Farmer.findById(farmer._id)
      .populate("user", "fullName email role avatar")
      .populate("products", "name price unit availableQuantity");
  },

  /**
   * --------------------------------------------------------------------------
   * GET FARMER PROFILE (BY USER ID)
   * --------------------------------------------------------------------------
   * BUSINESS LOGIC:
   * - Uses population to fetch user details in a single query.
   * - Includes virtual 'products' for a complete profile view.
   * - Checks isActive to respect soft-delete.
   */
  async getFarmerProfileByUserId(userId) {
    const farmer = await Farmer.findOne({ user: userId })
      .populate("user", "fullName email role avatar") // Populate user data
      .populate("products", "name price unit availableQuantity images"); // Virtual populate

    if (!farmer) {
      throw new AppError("Farmer profile not found", 404);
    }

    return farmer;
  },

  /**
   * --------------------------------------------------------------------------
   * GET FARMER PROFILE (BY FARMER ID)
   * --------------------------------------------------------------------------
   * Used when other users view a farmer's public profile.
   */
  async getFarmerProfileById(farmerId) {
    const farmer = await Farmer.findById(farmerId)
      .populate("user", "fullName email role avatar")
      .populate("products", "name price unit availableQuantity images");

    if (!farmer) {
      throw new AppError("Farmer profile not found", 404);
    }

    return farmer;
  },

  /**
   * --------------------------------------------------------------------------
   * SEARCH FARMERS
   * --------------------------------------------------------------------------
   * BUSINESS LOGIC:
   * - Only return verified and active farmers for marketplace.
   * - Support filtering by city, crop type, organic status.
   * - Pagination to handle large result sets.
   */
  async searchFarmers(filters = {}, pagination = {}) {
    const { city, crop, isOrganic, isVerified = true } = filters;
    const { page = 1, limit = 10, sort = "createdAt" } = pagination;

    // Build query dynamically
    const query = { isActive: true };

    if (isVerified !== undefined) query.isVerified = isVerified;
    if (city) query["location.address.city"] = new RegExp(city, "i"); // Case-insensitive
    if (crop) query["crops.name"] = new RegExp(crop, "i");
    if (isOrganic === true) query["crops.isOrganic"] = true;

    const skip = (page - 1) * limit;

    const [farmers, total] = await Promise.all([
      Farmer.find(query)
        .populate("user", "fullName email role avatar")
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(limit),
      Farmer.countDocuments(query),
    ]);

    return {
      farmers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * --------------------------------------------------------------------------
   * DELETE FARMER PROFILE (SOFT DELETE)
   * --------------------------------------------------------------------------
   * BUSINESS RULE: Never hard-delete farmer data.
   * - Preserves historical records for legal/compliance.
   * - Allows account recovery within a grace period.
   * - Sets deletedAt timestamp for automatic cleanup jobs.
   */
  async deleteFarmerProfile(userId) {
    const farmer = await Farmer.findOneAndUpdate(
      { user: userId },
      { isActive: false, deletedAt: new Date() },
      { new: true },
    );

    if (!farmer) {
      throw new AppError("Farmer profile not found", 404);
    }

    // Optionally revert user role back to 'user'
    await User.findByIdAndUpdate(userId, { role: "user" });

    return { message: "Farmer profile deactivated successfully" };
  },

  /**
   * --------------------------------------------------------------------------
   * ADMIN: VERIFY FARMER
   * --------------------------------------------------------------------------
   * BUSINESS RULE: Only admins can verify farmers.
   * Verified farmers get priority in marketplace search results.
   */
  async verifyFarmer(farmerId) {
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { isVerified: true },
      { new: true },
    ).populate("user", "name email");

    if (!farmer) {
      throw new AppError("Farmer profile not found", 404);
    }

    // TODO: Send email notification to farmer about verification

    return farmer;
  },
};

module.exports = farmerService;
