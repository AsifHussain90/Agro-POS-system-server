import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  addItem,
  getCart as getCartService,
  updateItemQuantity,
  removeItem,
  clearCart as clearCartService,
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

// POST /api/cart
export const addToCart = asyncHandler(async (req, res) => {
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

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  const cart = await getCartService({ userId, sessionId });
  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Cart retrieved'));
});

// PUT /api/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
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

// DELETE /api/cart/:itemId
export const removeCartItem = asyncHandler(async (req, res) => {
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

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const sessionId = getSessionId(req);

  await clearCartService({ userId, sessionId });
  clearSessionCookie(res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Cart cleared'));
});

// POST /api/cart/merge
export const mergeCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.body;

  const cart = await mergeGuestCart({ userId, sessionId });
  clearSessionCookie(res);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Guest cart merged successfully'));
});