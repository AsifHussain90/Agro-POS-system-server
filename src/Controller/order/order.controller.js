import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { Order } from "../../model/order.model.js";
import { Product } from "../../model/product.model.js";

export const createOrder = asyncHandler(async (req, res) => {
  const items = req.body.products;
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  if (products.length !== items.length) {
    throw new ApiError(400, "One or more products are invalid or inactive");
  }

  const orderItems = items.map((item) => {
    const product = products.find((p) => p._id.equals(item.productId));
    return {
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const farmerIds = [
    ...new Set(products.map((product) => product.farmer.toString())),
  ];
  if (farmerIds.length !== 1) {
    throw new ApiError(
      400,
      "All products in the order must belong to a single farmer",
    );
  }

  const order = await Order.create({
    buyer: req.user._id,
    farmer: farmerIds[0],
    products: orderItems,
    totalAmount,
  });

  return res.status(201).json(new ApiResponse(201, order, "Order created"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate(
    "products.product",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Order history retrieved"));
});

export const getFarmerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ farmer: req.user._id }).populate(
    "products.product",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Farmer orders retrieved"));
});
