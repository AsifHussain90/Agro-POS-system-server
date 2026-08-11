import asyncHandler from '../../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import * as authServiceModule from '../../services/auth.service.js';
import { toSafeUser } from '../../services/auth.service.js';
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
  sameSite: 'strict',
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

//register function is defined here
export const createAuthController = ({
  authService = authServiceModule,
  userModel = User,
  accessTokenGenerator = generateAccessToken,
  refreshTokenGenerator = generateRefreshToken,
} = {}) => {
  const register = asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);
    setRefreshCookie(res, data.refreshToken);

    return sendResponse(res, 201, 'User created', {
      user: data.user,
      accessToken: data.accessToken,
    });
  });

  const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    setRefreshCookie(res, data.refreshToken);

    return sendResponse(res, 200, 'Login successful', {
      user: data.user,
      accessToken: data.accessToken,
    });
  });

  const profile = asyncHandler(async (req, res) => {
    return sendResponse(res, 200, 'Profile fetched successfully', {
      user: req.user,
    });
  });

  const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
        const user = await userModel
          .findById(decoded._id)
          .select('+refreshToken');

        if (user) await user.clearRefreshToken();
      } catch {
        // ignore invalid tokens and still clear cookies
      }
    }

    clearRefreshCookie(res);
    return sendResponse(res, 200, 'Logged out successfully');
  });

  const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await userModel.findById(decoded._id).select('+refreshToken');

    if (!user || !(await user.isRefreshTokenValid(refreshToken))) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = accessTokenGenerator(user);
    const newRefreshToken = refreshTokenGenerator(user);

    await user.setRefreshToken(newRefreshToken);
    setRefreshCookie(res, newRefreshToken);

    return sendResponse(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
      user: toSafeUser(user),
    });
  });

  return { register, login, profile, logout, refreshAccessToken };
};

const authController = createAuthController();

export const register = authController.register;
export const login = authController.login;
export const profile = authController.profile;
export const logout = authController.logout;
export const refreshAccessToken = authController.refreshAccessToken;
