import { Order } from '../model/order.model.js';
import { Product } from '../model/product.model.js';
import { Farmer } from '../model/farmer.model.js';
import ApiError from '../utils/errorHandler.js';

export const createOrderService = ({
  orderModel = Order,
  productModel = Product,
  farmerModel = Farmer,
} = {}) => ({
  createOrder: async (buyerId, payload) => {
    const { products: orderItems } = payload;

    // Fetch all products in one query
    const productIds = orderItems.map((item) => item.productId);
    const products = await productModel.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== productIds.length) {
      throw new ApiError(404, 'One or more products not found or inactive');
    }

    // Build order items with price snapshot + validate stock
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of orderItems) {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );

      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      if (product.quantity < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }

      enrichedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    // All products must belong to the same farmer
    const farmerIds = [...new Set(products.map((p) => p.farmer.toString()))];
    if (farmerIds.length > 1) {
      throw new ApiError(400, 'All products must be from the same farmer');
    }

    // Get farmer userId from Farmer profile
    const farmerProfile = await farmerModel.findById(farmerIds[0]);
    if (!farmerProfile) {
      throw new ApiError(404, 'Farmer profile not found');
    }

    // Decrement stock for all products
    for (const item of orderItems) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Create order
    const order = await orderModel.create({
      buyer: buyerId,
      farmer: farmerProfile.userId,
      products: enrichedItems,
      totalAmount,
      status: 'pending',
    });

    return order.populate([
      { path: 'buyer', select: 'fullName email' },
      { path: 'farmer', select: 'fullName email' },
      { path: 'products.product', select: 'name price category' },
    ]);
  },

  getMyOrders: async (buyerId) => {
    return orderModel
      .find({ buyer: buyerId })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'buyer', select: 'fullName email' },
        { path: 'farmer', select: 'fullName email' },
        { path: 'products.product', select: 'name price category' },
      ]);
  },

  getFarmerOrders: async (farmerUserId) => {
    return orderModel
      .find({ farmer: farmerUserId })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'buyer', select: 'fullName email' },
        { path: 'farmer', select: 'fullName email' },
        { path: 'products.product', select: 'name price category' },
      ]);
  },

  updateOrderStatus: async (userId, userRole, orderId, status) => {
    const order = await orderModel.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');

    // Farmer can mark pending → completed
    // Buyer can mark pending → cancelled
    // Admin can do anything

    if (userRole === 'farmer' && order.farmer.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to update this order');
    }

    if (userRole === 'user' && order.buyer.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to update this order');
    }

    if (order.status !== 'pending') {
      throw new ApiError(400, `Cannot update order that is already ${order.status}`);
    }

    order.status = status;
    await order.save();

    return order.populate([
      { path: 'buyer', select: 'fullName email' },
      { path: 'farmer', select: 'fullName email' },
      { path: 'products.product', select: 'name price category' },
    ]);
  },

  getOrderById: async (userId, userRole, orderId) => {
    const order = await orderModel.findById(orderId).populate([
      { path: 'buyer', select: 'fullName email' },
      { path: 'farmer', select: 'fullName email' },
      { path: 'products.product', select: 'name price category' },
    ]);

    if (!order) throw new ApiError(404, 'Order not found');

    // Only buyer, farmer, or admin can view
    const isBuyer = order.buyer._id.toString() === userId;
    const isFarmer = order.farmer._id.toString() === userId;

    if (userRole !== 'admin' && !isBuyer && !isFarmer) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    return order;
  },
});

const orderService = createOrderService();

export const createOrder = orderService.createOrder;
export const getMyOrders = orderService.getMyOrders;
export const getFarmerOrders = orderService.getFarmerOrders;
export const updateOrderStatus = orderService.updateOrderStatus;
export const getOrderById = orderService.getOrderById;