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
  avatar: user.avatar?.url
    ? { url: user.avatar.url, publicId: user.avatar.publicId }
    : null,
});

const issueTokens = async (
  user,
  { accessTokenGenerator, refreshTokenGenerator }
) => {
  const accessToken = accessTokenGenerator(user);
  const refreshToken = refreshTokenGenerator(user);

  await user.setRefreshToken(refreshToken);

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
  };
};

export const createAuthService = ({
  UserModel = User,
  accessTokenGenerator = generateAccessToken,
  refreshTokenGenerator = generateRefreshToken,
} = {}) => ({
  register: async ({ fullName, email, password, role = 'user' }) => {
    const normalizedEmail = email.toLowerCase();

    const exists = await UserModel.findOne({ email: normalizedEmail });
    if (exists) throw new ApiError(409, 'User already exists');

    // Only allow 'user' or 'buyer' from public registration
    const allowedRoles = ['user', 'buyer'];
    const safeRole = allowedRoles.includes(role) ? role : 'user';

    const user = await UserModel.create({
      fullName,
      email: normalizedEmail,
      password,
      role: safeRole,
    });

    return issueTokens(user, { accessTokenGenerator, refreshTokenGenerator });
  },

  login: async ({ email, password }) => {
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!user) throw new ApiError(401, 'Invalid email or password');

    const match = await user.isPasswordCorrect(password);
    if (!match) throw new ApiError(401, 'Invalid email or password');

    if (!user.isActive) {
      throw new ApiError(403, 'Account deactivated');
    }

    return issueTokens(user, { accessTokenGenerator, refreshTokenGenerator });
  },

  changePassword: async ({ userId, oldPassword, newPassword }) => {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    const match = await user.isPasswordCorrect(oldPassword);
    if (!match) throw new ApiError(401, 'Incorrect old password');

    user.password = newPassword;
    user.changePassword = false;
    await user.save();

    return { success: true };
  },

  superAdminRegister: async ({ fullName, email, password, secretKey }) => {
    const expectedKey = process.env.SUPERADMIN_SECRET_KEY;
    if (!expectedKey || secretKey !== expectedKey) {
      throw new ApiError(403, 'Invalid secret key');
    }

    const normalizedEmail = email.toLowerCase();
    const exists = await UserModel.findOne({ email: normalizedEmail });
    if (exists) throw new ApiError(409, 'User already exists');

    const user = await UserModel.create({
      fullName,
      email: normalizedEmail,
      password,
      role: 'superAdmin',
    });

    return issueTokens(user, { accessTokenGenerator, refreshTokenGenerator });
  },
});

const authService = createAuthService();

export const register = authService.register;
export const login = authService.login;
export const changePassword = authService.changePassword;
export const superAdminRegister = authService.superAdminRegister;