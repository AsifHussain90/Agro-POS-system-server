import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { User } from '../../model/user.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
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

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await user.setRefreshToken(refreshToken);
  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken, user };
};

export const registerVisitor = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body;
  const normalizedEmail = req.body.email.toLowerCase().trim();
  
  if (!fullName || !normalizedEmail || !password) {
    throw new ApiError(400, 'fullName, email, and password are required');
  }
  
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const user = await User.create({
    fullName: req.body.fullName.trim(),   // ← Only allowed fields
    email: normalizedEmail,
    password: req.body.password,
    role: 'visitor',
    changePassword: false,
});
  const tokens = await issueTokens(user, res);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          changePassword: user.changePassword,
        },
        accessToken: tokens.accessToken,
      },
      'user registered successfully'
    )
  );
});

export const loginVisitor = asyncHandler(async (req, res) => {

  if (user.role !== 'visitor') {
    throw new ApiError(403, 'Please use the standard login endpoint');
}

  if (!req.body.email || !req.body.password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({
    email: req.body.email.toLowerCase().trim(),
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(req.body.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.changePassword) {
    return res.status(403).json({
      success: false,
      message: 'Password change required',
      data: {
        changePassword: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  }

  const tokens = await issueTokens(user, res);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          changePassword: user.changePassword,
        },
        accessToken: tokens.accessToken,
      },
      'Login successful'
    )
  );
});

export const changePasswordVisitor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isValid = await user.isPasswordCorrect(req.body.currentPassword);
  if (!isValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = req.body.newPassword;
  user.changePassword = false;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password changed successfully'));
});
