import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { User } from '../../model/user.model.js';
import { Farmer } from '../../model/farmer.model.js';
import { Product } from '../../model/product.model.js';
import { Order } from '../../model/order.model.js';
import { FarmerRequest } from '../../model/farmerRequest.model.js';
import {
  getPaginationOptions,
  buildPaginatedResponse,
} from '../../utils/paginate.js';
import mongoose from 'mongoose';

// GET /api/admin/users
export const getAllUsersController = asyncHandler(async (req, res) => {
  // CHANGE 1: Add authorization check
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can access this resource');
  }

  const { skip, limit, sort, page, limitNum } = getPaginationOptions(req.query);

  // CHANGE 2: Validate pagination bounds
  if (limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, 'Limit must be between 1 and 100');
  }

  const filter = {};

  // CHANGE 3: Validate role parameter
  if (req.query.role) {
    const validRoles = ['user', 'farmer', 'admin'];
    if (!validRoles.includes(req.query.role)) {
      throw new ApiError(400, 'Invalid role provided');
    }
    filter.role = req.query.role;
  }

  // CHANGE 4: Validate search length
  if (req.query.search) {
    if (req.query.search.length > 50) {
      throw new ApiError(400, 'Search query too long');
    }
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildPaginatedResponse(users, total, page, limitNum),
        'Users retrieved successfully'
      )
    );
});

// PATCH /api/admin/users/:id/block
export const toggleBlockUserController = asyncHandler(async (req, res) => {
  // CHANGE 5: Add authorization check
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can access this resource');
  }

  const { id } = req.params;

  // CHANGE 6: Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  // CHANGE 7: Prevent admin from blocking themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot block yourself');
  }

  // CHANGE 8: Prevent blocking other admins
  if (
    user.role === 'admin' &&
    user._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Cannot block other admin users');
  }

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: user._id, isBlocked: user.isBlocked },
        `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
      )
    );
});

// GET /api/admin/dashboard
export const getDashboardStatsController = asyncHandler(async (req, res) => {
  // CHANGE 9: Add authorization check
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can access this resource');
  }

  const [
    totalUsers,
    totalFarmers,
    totalProducts,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
  ] = await Promise.all([
    // CHANGE 10: Only count active (non-blocked) users
    User.countDocuments({ isBlocked: false }),
    // CHANGE 11: Only count active farmers
    User.countDocuments({ role: 'farmer', isBlocked: false }),
    // CHANGE 12: Only count non-deleted products
    Product.countDocuments({ isDeleted: false }),
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'completed' }),
    Order.countDocuments({ status: 'cancelled' }),
    FarmerRequest.countDocuments({ status: 'pending' }),
    FarmerRequest.countDocuments({ status: 'approved' }),
    FarmerRequest.countDocuments({ status: 'rejected' }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: { total: totalUsers, farmers: totalFarmers },
        products: { total: totalProducts },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        farmerRequests: {
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
        },
      },
      'Dashboard statistics retrieved successfully'
    )
  );
});
