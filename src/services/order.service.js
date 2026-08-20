import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { Order } from '../../model/order.model.js';
import { Product } from '../../model/product.model.js';
import { Farmer } from '../../model/farmer.model.js';
import { BuyerProfile } from '../../model/buyerProfile.model.js';
import { CartSession } from '../../model/cartSession.model.js';

export const createOrderController = asyncHandler(async (req, res) => {
  const { products } = req.body;
  const buyerId = req.user._id;

  // Require buyer profile
  const buyerProfile = await BuyerProfile.findOne({ userId: buyerId });
  if (!buyerProfile) {
    throw new ApiError(400, 'Complete your profile before placing an order');
  }

  // Get default or first saved address
  const savedAddress =
    buyerProfile.savedAddresses.find((addr) => addr.isDefault) ||
    buyerProfile.savedAddresses[0];

  if (!savedAddress) {
    throw new ApiError(400, 'Please add a delivery address to your profile');
  }

  let totalAmount = 0;
  const orderItems = [];
  let farmerId = null;

  for (const item of products) {
    const product = await Product.findById(item.productId).populate('farmer');
    if (!product) throw new ApiError(404, `Product ${item.productId} not found`);
    if (!product.isActive) throw new ApiError(400, `Product ${product.name} is not available`);
    if (product.quantity < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    if (!farmerId) farmerId = product.farmer._id;
    else if (farmerId.toString() !== product.farmer._id.toString()) {
      throw new ApiError(400, 'All products must be from the same farmer');
    }

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });

    product.quantity -= item.quantity;
    await product.save();
    totalAmount += product.price * item.quantity;
  }

  // Build delivery snapshot from profile
  const deliveryDetails = {
    fullName: req.user.fullName,
    email: req.user.email,
    phone: buyerProfile.phone,
    alternatePhone: buyerProfile.alternatePhone,
    address: {
      street: savedAddress.street,
      city: savedAddress.city,
      state: savedAddress.state,
      country: savedAddress.country,
      zipCode: savedAddress.zipCode,
      landmark: savedAddress.landmark,
    },
    deliveryType: buyerProfile.deliveryPreferences?.type || 'home_delivery',
    preferredDate: req.body.preferredDate || null,
    timeSlot: buyerProfile.deliveryPreferences?.timeSlot || 'morning',
    instructions: buyerProfile.deliveryPreferences?.instructions || '',
  };

  const order = await Order.create({
    buyer: buyerId,
    farmer: farmerId,
    products: orderItems,
    totalAmount,
    deliveryDetails,
  });

  // Clear cart
  await CartSession.findOneAndDelete({ userId: buyerId });

  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName userId')
    .populate('products.product', 'name price category images');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedOrder, 'Order placed successfully'));
});

export const getMyOrdersController = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('products.product', 'name price category images')
    .populate('farmer', 'farmName')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Orders retrieved'));
});

export const getFarmerOrdersController = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) throw new ApiError(404, 'Farmer profile not found');

  const orders = await Order.find({ farmer: farmer._id })
    .populate('buyer', 'fullName email')
    .populate('products.product', 'name price category images')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Farmer orders retrieved'));
});

export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName userId')
    .populate('products.product', 'name price category images');

  if (!order) throw new ApiError(404, 'Order not found');

  const farmer = await Farmer.findOne({ userId: req.user._id });
  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isFarmer = farmer && order.farmer._id.toString() === farmer._id.toString();

  if (!isBuyer && !isFarmer && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(403, 'Forbidden');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order retrieved'));
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const farmer = await Farmer.findOne({ userId: req.user._id });
  const isFarmer = farmer && order.farmer.toString() === farmer._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'superAdmin';

  if (!isFarmer && !isAdmin) {
    throw new ApiError(403, 'Forbidden');
  }

  order.status = status;
  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName')
    .populate('products.product', 'name price category images');

  return res
    .status(200)
    .json(new ApiResponse(200, populatedOrder, 'Order status updated'));
});

export const trackOrderController = asyncHandler(async (req, res) => {
  const { email, orderId } = req.query;

  if (!email || !orderId) {
    throw new ApiError(400, 'Email and order ID are required');
  }

  const order = await Order.findById(orderId)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName')
    .populate('products.product', 'name price category images');

  if (!order) throw new ApiError(404, 'Order not found');

  if (order.buyer.email.toLowerCase() !== email.toLowerCase()) {
    throw new ApiError(403, 'Invalid tracking credentials');
  }

  const trackingInfo = {
    orderId: order._id,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    products: order.products.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
    })),
    farmerName: order.farmer.farmName,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, trackingInfo, 'Order tracked successfully'));
});