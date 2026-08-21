import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/errorHandler.js';
import { User } from '../model/user.model.js';
import { getAccessTokenSecret } from '../utils/tokenGenerator.js';
import { hasPermission } from '../config/permission.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const header = req.headers?.authorization || req.headers?.Authorization;

  if (!header) {
    throw new ApiError(401, 'Unauthorized — missing authorization header');
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new ApiError(401, 'Unauthorized — invalid token format');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getAccessTokenSecret());
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw new ApiError(401, 'Invalid token');
  }

  req.user = await User.findById(decoded._id).select(
    '-password -refreshToken -refreshTokenVersion'
  );

  if (!req.user) {
    throw new ApiError(401, 'Unauthorized — user no longer exists');
  }

  if (!req.user.isActive) {
    throw new ApiError(403, 'Account deactivated');
  }


  if (req.user.isBlocked) {
    throw new ApiError(403, 'User is blocked');
  }

  next();
});

export const checkActive = asyncHandler(async (req, res, next) => {
  if (!req.user?.isActive) {
    throw new ApiError(403, 'Account deactivated');
  }
  next();
});

const checkRole = (role) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }
    if (req.user.role !== role) {
      throw new ApiError(403, `Forbidden — requires ${role} role`);
    }
    next();
  });

export const isAdmin = checkRole('admin');
export const isFarmer = checkRole('farmer');
export const isBuyer = checkRole('buyer');
export const isUser = checkRole('user');
export const isSuperAdmin = checkRole('superAdmin');

export const requirePermission = (permission) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }
    if (!hasPermission(req.user.role, permission)) {
      throw new ApiError(403, `Forbidden — missing permission: ${permission}`);
    }
    next();
  });