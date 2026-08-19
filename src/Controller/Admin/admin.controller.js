import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { User } from '../../model/user.model.js';
import { Product } from '../../model/product.model.js';
import { Order } from '../../model/order.model.js';
import { FarmerRequest } from '../../model/farmerRequest.model.js';

export const getAllUsersController = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;
  const query = {};

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Users retrieved'
    )
  );
});

export const toggleBlockUserController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'superAdmin') {
    throw new ApiError(403, 'Cannot block superAdmin');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: user._id, isBlocked: user.isBlocked },
        'User block status updated'
      )
    );
});

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const [userStats, productStats, orderStats, requestStats] = await Promise.all(
    [
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            farmers: {
              $sum: { $cond: [{ $eq: ['$role', 'farmer'] }, 1, 0] },
            },
            buyers: {
              $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] },
            },
            admins: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
            },
          },
        },
      ]),
      Product.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      FarmerRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]
  );

  const orderMap = Object.fromEntries(orderStats.map((s) => [s._id, s.count]));
  const requestMap = Object.fromEntries(
    requestStats.map((s) => [s._id, s.count])
  );

  const stats = {
    users: userStats[0] || { total: 0, farmers: 0, buyers: 0, admins: 0 },
    products: { total: productStats },
    orders: {
      total: Object.values(orderMap).reduce((a, b) => a + b, 0),
      pending: orderMap.pending || 0,
      completed: orderMap.completed || 0,
      cancelled: orderMap.cancelled || 0,
    },
    farmerRequests: {
      pending: requestMap.pending || 0,
      approved: requestMap.approved || 0,
      rejected: requestMap.rejected || 0,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Dashboard statistics retrieved'));
});

// NEW: Admin sees all orders with delivery details
export const getAllOrdersAdminController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    Order.find(query)
      .populate('buyer', 'fullName email')
      .populate('farmer', 'farmName userId')
      .populate('products.product', 'name price category images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data, total, page: Number(page), limit: Number(limit) },
        'All orders retrieved'
      )
    );
});

// NEW: Admin gets single order detail
export const getOrderByIdAdminController = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName userId')
    .populate('products.product', 'name price category images');

  if (!order) throw new ApiError(404, 'Order not found');

  return res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
});

// NEW: Admin lists all buyers
export const getAllBuyersController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { role: 'buyer' };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data, total, page: Number(page), limit: Number(limit) },
        'Buyers retrieved'
      )
    );
});
