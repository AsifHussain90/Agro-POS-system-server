import { Product } from '../model/product.model.js';
import ApiError from '../utils/errorHandler.js';

export const createProductService = ({
  productModel = Product,
} = {}) => ({
  createProduct: async (farmerId, payload) => {
    const product = await productModel.create({
      farmer: farmerId,
      ...payload,
    });
    return product;
  },

  getAllProducts: async (filters = {}) => {
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = filters;
    const query = { isActive: true };

    // FIXED: Sanitize search input to prevent ReDoS and NoSQL injection
    if (search) {
      const safeSearch = search.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (safeSearch) {
        query.$text = { $search: safeSearch };
      }
    }

    if (category) query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      productModel
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .populate('farmer', 'farmName userId')
        .sort({ createdAt: -1 }),
      productModel.countDocuments(query),
    ]);

    return { products, total, page: Number(page), limit: Number(limit) };
  },

  getProductById: async (productId) => {
    const product = await productModel
      .findById(productId)
      .populate('farmer', 'farmName userId');
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  },

  getFarmerProducts: async (farmerId) => {
    return productModel
      .find({ farmer: farmerId })
      .sort({ createdAt: -1 });
  },

  updateProduct: async (farmerId, productId, payload) => {
    const product = await productModel.findOneAndUpdate(
      { _id: productId, farmer: farmerId },
      payload,
      { new: true, runValidators: true }
    );
    if (!product) throw new ApiError(404, 'Product not found or unauthorized');
    return product;
  },

  deleteProduct: async (farmerId, productId) => {
    const product = await productModel.findOneAndDelete({
      _id: productId,
      farmer: farmerId,
    });
    if (!product) throw new ApiError(404, 'Product not found or unauthorized');
    return product;
  },
});

const productService = createProductService();

export const createProduct = productService.createProduct;
export const getAllProducts = productService.getAllProducts;
export const getProductById = productService.getProductById;
export const getFarmerProducts = productService.getFarmerProducts;
export const updateProduct = productService.updateProduct;
export const deleteProduct = productService.deleteProduct;