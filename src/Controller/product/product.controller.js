import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from '../../services/product.service.js';

// POST /api/products
export const createProductController = asyncHandler(async (req, res) => {
  const product = await createProduct(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, product, 'Product created successfully'));
});

// GET /api/products
export const getAllProductsController = asyncHandler(async (req, res) => {
  const result = await getAllProducts(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Products retrieved successfully'));
});

// GET /api/products/:id
export const getProductByIdController = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product retrieved successfully'));
});

// GET /api/products/my-products
export const getMyProductsController = asyncHandler(async (req, res) => {
  const products = await getMyProducts(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, products, 'My products retrieved successfully'));
});

// PUT /api/products/:id
export const updateProductController = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.user._id, req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product updated successfully'));
});

// DELETE /api/products/:id
export const deleteProductController = asyncHandler(async (req, res) => {
  const result = await deleteProduct(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Product deleted successfully'));
});