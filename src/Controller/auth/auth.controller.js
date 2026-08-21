import asyncHandler from '../../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import * as authService from '../../services/auth.service.js';
import ApiResponse from '../../utils/apiResponse.js';
import { User } from '../../model/user.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenSecret,
} from '../../utils/tokenGenerator.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', cookieOptions);
};

const sendResponse = (res, statusCode, message, data = null) => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
};

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  setRefreshCookie(res, data.refreshToken);
  return sendResponse(res, 201, 'User created successfully', {
    user: data.user,
    accessToken: data.accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  setRefreshCookie(res, data.refreshToken);
  return sendResponse(res, 200, 'Login successful', {
    user: data.user,
    accessToken: data.accessToken,
  });
});

export const profile = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Profile fetched successfully', {
    user: req.user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
      const user = await User.findById(decoded._id).select('+refreshToken');
      if (user) await user.clearRefreshToken();
    } catch {
      // ignore invalid tokens
    }
  }
  clearRefreshCookie(res);
  return sendResponse(res, 200, 'Logged out successfully');
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token missing' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || !(await user.isRefreshTokenValid(refreshToken))) {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await user.setRefreshToken(newRefreshToken);
  setRefreshCookie(res, newRefreshToken);

  return sendResponse(res, 200, 'Token refreshed', {
    accessToken: newAccessToken,
    user: authService.toSafeUser(user),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword({
    userId: req.user._id,
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword,
  });
  return sendResponse(res, 200, 'Password changed successfully');
});

export const superAdminRegister = asyncHandler(async (req, res) => {
  const data = await authService.superAdminRegister(req.body);
  setRefreshCookie(res, data.refreshToken);
  return sendResponse(res, 201, 'SuperAdmin created successfully', {
    user: data.user,
    accessToken: data.accessToken,
  });
});