import { Product } from '../model/product.model.js';
import { Farmer } from '../model/farmer.model.js';
import ApiError from '../utils/errorHandler.js';

export const createProductService = ({
  productModel = Product,
  farmerModel = Farmer,
} = {}) => ({
  createProduct: async (userId, payload) => {
    // Find farmer profile for this user
    const farmer = await farmerModel.findOne({ userId });
    if (!farmer) {
      throw new ApiError(404, 'Farmer profile not found');
    }

    if (!farmer.isActive) {
      throw new ApiError(403, 'Farmer account is inactive');
    }

    const product = await productModel.create({
      farmer: farmer._id,
      ...payload,
    });

    return product.populate('farmer', 'farmName userId');
  },
// getting all product and also getting the search product base on query
  getAllProducts: async (filters = {}) => {
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = filters;

    const query = { isActive: true };

    if (category) query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      productModel
        .find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('farmer', 'farmName userId'),
      productModel.countDocuments(query),
    ]);

    return { products, total, page: Number(page), limit: Number(limit) };
  },

  getProductById: async (id) => {
    const product = await productModel
      .findById(id)
      .populate('farmer', 'farmName userId');

    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  },

  getMyProducts: async (userId) => {
    const farmer = await farmerModel.findOne({ userId });
    if (!farmer) throw new ApiError(404, 'Farmer profile not found');

    return productModel
      .find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .populate('farmer', 'farmName userId');
  },

  updateProduct: async (userId, productId, payload) => {
    const farmer = await farmerModel.findOne({ userId });
    if (!farmer) throw new ApiError(404, 'Farmer profile not found');

    const product = await productModel.findOne({
      _id: productId,
      farmer: farmer._id,
    });

    if (!product) throw new ApiError(404, 'Product not found or access denied');

    Object.assign(product, payload);
    await product.save();

    return product.populate('farmer', 'farmName userId');
  },

  deleteProduct: async (userId, productId) => {
    const farmer = await farmerModel.findOne({ userId });
    if (!farmer) throw new ApiError(404, 'Farmer profile not found');

    const product = await productModel.findOneAndDelete({
      _id: productId,
      farmer: farmer._id,
    });

    if (!product) throw new ApiError(404, 'Product not found or access denied');

    return { deleted: true, productId };
  },
});

const productService = createProductService();

export const createProduct = productService.createProduct;
export const getAllProducts = productService.getAllProducts;
export const getProductById = productService.getProductById;
export const getMyProducts = productService.getMyProducts;
export const updateProduct = productService.updateProduct;
export const deleteProduct = productService.deleteProduct;