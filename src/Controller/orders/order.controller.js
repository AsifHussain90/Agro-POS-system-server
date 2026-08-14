import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  getOrderById,
} from '../../services/order.service.js';

// POST /api/orders
export const createOrderController = asyncHandler(async (req, res) => {
  const order = await createOrder(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, order, 'Order placed successfully'));
});

// GET /api/orders/my-orders
export const getMyOrdersController = asyncHandler(async (req, res) => {
  const orders = await getMyOrders(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'My orders retrieved successfully'));
});

// GET /api/orders/farmer-orders
export const getFarmerOrdersController = asyncHandler(async (req, res) => {
  const orders = await getFarmerOrders(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Farmer orders retrieved successfully'));
});

// GET /api/orders/:id
export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(
    req.user._id,
    req.user.role,
    req.params.id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order retrieved successfully'));
});

// PATCH /api/orders/:id/status
export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const order = await updateOrderStatus(
    req.user._id,
    req.user.role,
    req.params.id,
    req.body.status
  );
  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order status updated successfully'));
});