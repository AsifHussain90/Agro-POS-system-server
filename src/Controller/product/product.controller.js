import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { Product } from "../../model/product.model.js";

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate(
    "farmer",
    "fullName email",
  );
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products retrieved"));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "farmer",
    "fullName email",
  );
  if (!product || !product.isActive)
    throw new ApiError(404, "Product not found");
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved"));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    farmer: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201, product, "Product created"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive)
    throw new ApiError(404, "Product not found");
  if (!product.farmer.equals(req.user._id))
    throw new ApiError(403, "Forbidden");

  Object.assign(product, req.body);
  await product.save();

  return res.status(200).json(new ApiResponse(200, product, "Product updated"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive)
    throw new ApiError(404, "Product not found");
  if (!product.farmer.equals(req.user._id))
    throw new ApiError(403, "Forbidden");

  product.isActive = false;
  await product.save();

  return res.status(200).json(new ApiResponse(200, null, "Product deleted"));
});
