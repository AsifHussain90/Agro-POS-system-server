import bcrypt from 'bcryptjs';
import { User } from '../model/user.model.js';
import ApiError from '../utils/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/tokenGenerator.js';

export const toSafeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isBlocked: user.isBlocked,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

export const register = async (payload) => {
  const { fullName, email, password, role = 'user' } = payload;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,
    role,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await user.setRefreshToken(refreshToken);

  return { user: toSafeUser(user), accessToken, refreshToken };
};

export const login = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account deactivated');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'User is blocked');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await user.setRefreshToken(refreshToken);

  return { user: toSafeUser(user), accessToken, refreshToken };
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return true;
};

export const superAdminRegister = async (payload) => {
  const { secretKey } = payload;

  const expectedKey = process.env.SUPERADMIN_SECRET_KEY;
  if (!expectedKey) {
    throw new ApiError(500, 'Server misconfiguration: SUPERADMIN_SECRET_KEY not set');
  }

  const isValidKey = await bcrypt.compare(secretKey, expectedKey);
  if (!isValidKey) {
    throw new ApiError(403, 'Invalid secret key');
  }

  return register({ ...payload, role: 'superAdmin' });
};