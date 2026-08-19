import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/errorHandler.js';
import { User } from '../model/user.model.js';
import { getAccessTokenSecret } from '../utils/tokenGenerator.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const header = req.headers?.authorization || req.headers?.Authorization;

  if (!header) {
    throw new ApiError(401, 'Unauthorized');
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new ApiError(401, 'Unauthorized');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getAccessTokenSecret());
  } catch {
    throw new ApiError(401, 'Unauthorized');
  }

  req.user = await User.findById(decoded._id).select(
    '-password -refreshToken'
  );

  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
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
      throw new ApiError(403, 'Forbidden');
    }
    next();
  });

export const isAdmin = checkRole('admin');
export const isFarmer = checkRole('farmer');
export const isUser = checkRole('user');
export const isBuyer = checkRole('buyer');
export const isSuperAdmin = checkRole('superAdmin');

export const requirePermission = (permission) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }
    const { hasPermission } = await import('../config/permissions.js');
    if (!hasPermission(req.user.role, permission)) {
      throw new ApiError(403, 'Forbidden');
    }
    next();
  });