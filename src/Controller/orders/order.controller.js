import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
import { Order } from '../../model/order.model.js';
import { Product } from '../../model/product.model.js';
import { Farmer } from '../../model/farmer.model.js';
import { BuyerProfile } from '../../model/buyerProfile.model.js';
import { CartSession } from '../../model/cartSession.model.js';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Creates an order atomically with stock decrement inside a transaction.
// ─────────────────────────────────────────────────────────────────────────────
export const createOrderController = asyncHandler(async (req, res) => {
  const { products, preferredDate } = req.body;
  const buyerId = req.user._id;

  // ── Validate buyer profile ───────────────────────────────────────────────
  const buyerProfile = await BuyerProfile.findOne({ userId: buyerId });
  if (!buyerProfile) {
    throw new ApiError(400, 'Complete your profile before placing an order');
  }

  const savedAddress =
    buyerProfile.savedAddresses.find((addr) => addr.isDefault) ||
    buyerProfile.savedAddresses[0];

  if (!savedAddress) {
    throw new ApiError(400, 'Please add a delivery address to your profile');
  }

  // ── Validate preferredDate ─────────────────────────────────────────────────
  let validatedPreferredDate = null;
  if (preferredDate) {
    const date = new Date(preferredDate);
    if (isNaN(date.getTime())) {
      throw new ApiError(400, 'Preferred date & time is invalid');
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now) {
      throw new ApiError(400, 'Preferred date & time must be today or in the future');
    }
    validatedPreferredDate = date;
  }

  // ── Transaction: stock decrement + order creation + cart clear ────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  let order;

  try {
    // 1. Validate products and atomically decrement stock
    const orderItems = [];
    let totalAmount = 0;
    let farmerId = null;

    for (const item of products) {
      const product = await Product.findById(item.productId)
        .session(session)
        .populate('farmer');

      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw new ApiError(400, `Product "${product.name}" is not available`);
      }

      // Atomic stock decrement with $inc + $gte condition
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          quantity: { $gte: item.quantity },
        },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`
        );
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

      totalAmount += product.price * item.quantity;
    }

    // 2. Build delivery snapshot from profile
    const deliveryDetails = {
      fullName: req.user.fullName,
      email: req.user.email,
      phone: buyerProfile.phone,
      alternatePhone: buyerProfile.alternatePhone || null,
      address: {
        street: savedAddress.street || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        country: savedAddress.country || '',
        zipCode: savedAddress.zipCode || '',
        landmark: savedAddress.landmark || '',
      },
      deliveryType: buyerProfile.deliveryPreferences?.type || 'home_delivery',
      preferredDate: validatedPreferredDate,
      timeSlot: buyerProfile.deliveryPreferences?.timeSlot || 'morning',
      instructions: buyerProfile.deliveryPreferences?.instructions || '',
    };

    // 3. Create order inside transaction
    [order] = await Order.create(
      [
        {
          buyer: buyerId,
          farmer: farmerId,
          products: orderItems,
          totalAmount,
          deliveryDetails,
          status: 'pending',
        },
      ],
      { session }
    );

    // 4. Clear cart inside transaction
    await CartSession.findOneAndDelete({ userId: buyerId }).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // Populate after transaction (outside session — read-only)
  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName userId')
    .populate('products.product', 'name price category images');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedOrder, 'Order placed successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-orders
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrdersController = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('products.product', 'name price category images')
    .populate('farmer', 'farmName')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, 'Orders retrieved'));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/farmer-orders
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Auth check BEFORE populate to avoid wasted queries.
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderByIdController = asyncHandler(async (req, res) => {
  const orderLean = await Order.findById(req.params.id).lean();
  if (!orderLean) throw new ApiError(404, 'Order not found');

  const farmer = await Farmer.findOne({ userId: req.user._id }).lean();
  const isBuyer = orderLean.buyer.toString() === req.user._id.toString();
  const isFarmer =
    farmer && orderLean.farmer.toString() === farmer._id.toString();

  if (!isBuyer && !isFarmer && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    throw new ApiError(403, 'Forbidden');
  }

  const order = await Order.findById(req.params.id)
    .populate('buyer', 'fullName email')
    .populate('farmer', 'farmName userId')
    .populate('products.product', 'name price category images');

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order retrieved'));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// ─────────────────────────────────────────────────────────────────────────────
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

  if (order.status !== 'pending') {
    throw new ApiError(400, `Cannot update order that is already ${order.status}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/track?email=&orderId=
// Public tracking with minimal data exposure.
// ─────────────────────────────────────────────────────────────────────────────
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

  if (order.buyer.email.toLowerCase() !== email.toLowerCase().trim()) {
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
    farmerName: order.farmer?.farmName || 'Unknown',
    deliveryDetails: {
      deliveryType: order.deliveryDetails?.deliveryType,
      timeSlot: order.deliveryDetails?.timeSlot,
      preferredDate: order.deliveryDetails?.preferredDate,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, trackingInfo, 'Order tracked successfully'));
});