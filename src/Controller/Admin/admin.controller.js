import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { User } from '../../model/user.model.js';
import { Farmer } from '../../model/farmer.model.js';
import { Product } from '../../model/product.model.js';
import { Order } from '../../model/order.model.js';
import { FarmerRequest } from '../../model/farmerRequest.model.js';
import { getPaginationOptions, buildPaginatedResponse } from '../../utils/paginate.js';

// GET /api/admin/users
export const getAllUsersController = asyncHandler(async (req, res) => {
  const { skip, limit, sort, page, limitNum } = getPaginationOptions(req.query);

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -refreshToken').sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      buildPaginatedResponse(users, total, page, limitNum),
      'Users retrieved successfully'
    )
  );
});

// PATCH /api/admin/users/:id/block
export const toggleBlockUserController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  // Prevent admin from blocking themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot block yourself');
  }

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { userId: user._id, isBlocked: user.isBlocked },
      `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
    )
  );
});

// GET /api/admin/dashboard
export const getDashboardStatsController = asyncHandler(async (req, res) => {
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
    User.countDocuments(),
    User.countDocuments({ role: 'farmer' }),
    Product.countDocuments(),
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