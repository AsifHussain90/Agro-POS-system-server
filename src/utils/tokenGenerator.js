import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const getAccessTokenSecret = () => requireEnv('ACCESS_TOKEN_SECRET');
export const getRefreshTokenSecret = () => requireEnv('REFRESH_TOKEN_SECRET');

const getAccessTokenExpiry = () =>
  process.env.ACCESS_TOKEN_EXPIRY || '15m';

const getRefreshTokenExpiry = () =>
  process.env.REFRESH_TOKEN_EXPIRY || '7d';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    getAccessTokenSecret(),
    { expiresIn: getAccessTokenExpiry() }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user._id }, getRefreshTokenSecret(), {
    expiresIn: getRefreshTokenExpiry(),
  });
};