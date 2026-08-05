import { Product } from "../model/product.model.js";
import ApiError from "../utils/errorHandler.js";

export const productService = {
  async verifyOwnership(productId, userId) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      throw new ApiError(404, "Product not found");
    if (!product.farmer.equals(userId)) throw new ApiError(403, "Forbidden");
    return product;
  },
};
