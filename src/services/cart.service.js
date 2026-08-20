import { CartSession } from '../model/cartSession.model.js';
import { Product } from '../model/product.model.js';
import ApiError from '../utils/errorHandler.js';
import crypto from 'crypto';

const generateSessionId = () => crypto.randomUUID();

export const createCartService = ({
  CartSessionModel = CartSession,
  ProductModel = Product,
} = {}) => ({
  getOrCreateCart: async ({ userId, sessionId }) => {
    if (userId) {
      let cart = await CartSessionModel.findOne({ userId });
      if (cart) return cart;
      cart = await CartSessionModel.create({ userId, items: [] });
      return cart;
    }

    if (sessionId) {
      let cart = await CartSessionModel.findOne({ sessionId });
      if (cart) return cart;
    }

    const newSessionId = generateSessionId();
    return CartSessionModel.create({ sessionId: newSessionId, items: [] });
  },

  addItem: async ({ userId, sessionId, productId, quantity }) => {
    const product = await ProductModel.findById(productId).populate('farmer');
    if (!product) throw new ApiError(404, 'Product not found');
    if (!product.isActive) throw new ApiError(400, 'Product is not available');

    const cart = await createCartService().getOrCreateCart({
      userId,
      sessionId,
    });

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      // Always keep the latest price from the product catalog
      cart.items[existingItemIndex].unitPrice = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        farmerId: product.farmer._id,
        farmerName: product.farmer.farmName || 'Unknown Farm',
        productName: product.name,
        quantity,
        unitPrice: product.price,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return cart;
  },

  getCart: async ({ userId, sessionId }) => {
    let cart = null;
    if (userId) {
      cart = await CartSessionModel.findOne({ userId }).populate(
        'items.productId',
        'name price images isActive'
      );
    } else if (sessionId) {
      cart = await CartSessionModel.findOne({ sessionId }).populate(
        'items.productId',
        'name price images isActive'
      );
    }

    // Consistent return shape — safe for callers to destructure
    return (
      cart || {
        _id: null,
        userId: userId || null,
        sessionId: sessionId || null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  },

  updateItemQuantity: async ({ userId, sessionId, itemId, quantity }) => {
    const query = userId ? { userId } : { sessionId };
    const cart = await CartSessionModel.findOne(query);
    if (!cart) throw new ApiError(404, 'Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new ApiError(404, 'Item not found in cart');

    item.quantity = quantity;
    await cart.save();
    return cart;
  },

  removeItem: async ({ userId, sessionId, itemId }) => {
    const query = userId ? { userId } : { sessionId };
    const cart = await CartSessionModel.findOne(query);
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );
    await cart.save();
    return cart;
  },

  clearCart: async ({ userId, sessionId }) => {
    const query = userId ? { userId } : { sessionId };
    await CartSessionModel.findOneAndDelete(query);
    return { cleared: true };
  },

  mergeGuestCart: async ({ userId, sessionId }) => {
    if (!userId || !sessionId) {
      throw new ApiError(400, 'User ID and session ID are required');
    }

    const [userCart, guestCart] = await Promise.all([
      CartSessionModel.findOne({ userId }),
      CartSessionModel.findOne({ sessionId }),
    ]);

    if (!guestCart || guestCart.items.length === 0) {
      return userCart || { items: [] };
    }

    if (!userCart) {
      guestCart.userId = userId;
      guestCart.sessionId = null;
      await guestCart.save();
      return guestCart;
    }

    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId.toString()
      );

      if (existingIndex >= 0) {
        userCart.items[existingIndex].quantity += guestItem.quantity;
        // FIXED: Keep the latest price (product catalog is source of truth)
        userCart.items[existingIndex].unitPrice = Math.max(
          userCart.items[existingIndex].unitPrice,
          guestItem.unitPrice
        );
      } else {
        userCart.items.push(guestItem);
      }
    }

    await userCart.save();
    await guestCart.deleteOne();

    return userCart;
  },
});

const cartService = createCartService();

export const getOrCreateCart = cartService.getOrCreateCart;
export const addItem = cartService.addItem;
export const getCart = cartService.getCart;
export const updateItemQuantity = cartService.updateItemQuantity;
export const removeItem = cartService.removeItem;
export const clearCart = cartService.clearCart;
export const mergeGuestCart = cartService.mergeGuestCart;