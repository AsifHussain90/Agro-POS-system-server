import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  addItem,
  getCart,
  updateItemQuantity,
  removeItem,
  clearCart,
  mergeGuestCart,
} from '../../services/cart.service.js';

const getSessionId = (req) => {
  return req.signedCookies?.cartSession || req.cookies?.cartSession || null;
};

const setSessionCookie = (res, sessionId) => {
  res.cookie('cartSession', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    signed: true,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie('cartSession', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    signed: true,
  });
};

export const addToCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  const cart = await addItem({
    userId,
    sessionId,
    productId: req.body.productId,
    quantity: req.body.quantity,
  });

  if (!userId && cart.sessionId) {
    setSessionCookie(res, cart.sessionId);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, cart, 'Item added to cart'));
});

export const getCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  const cart = await getCart({ userId, sessionId });
  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Cart retrieved'));
});

export const updateCartItemController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  const cart = await updateItemQuantity({
    userId,
    sessionId,
    itemId: req.params.itemId,
    quantity: req.body.quantity,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Cart item updated'));
});

export const removeCartItemController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  const cart = await removeItem({
    userId,
    sessionId,
    itemId: req.params.itemId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Item removed from cart'));
});

export const clearCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  await clearCart({ userId, sessionId });
  clearSessionCookie(res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Cart cleared'));
});

export const mergeCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;

  const cart = await mergeGuestCart({ userId, sessionId });
  clearSessionCookie(res);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Guest cart merged successfully'));
});