// Generates access and refresh tokens for the user
import {User} from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const getTokenSecret = (primaryName, legacyName) => {
  const secret = process.env[primaryName] || process.env[legacyName];

  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing ${primaryName} environment variable`);
  }

  return primaryName.includes('REFRESH')
    ? 'dev-refresh-secret'
    : 'dev-access-secret';
};

export const getAccessTokenSecret = () =>
  getTokenSecret('ACCESS_TOKEN_SECRET', 'SECRET_ACCESS_TOKEN');

export const getRefreshTokenSecret = () =>
  getTokenSecret('REFRESH_TOKEN_SECRET', 'SECRET_REFRESH_TOKEN');

const getAccessTokenExpiry = () =>
  process.env.ACCESS_TOKEN_EXPIRY ||
  process.env.SECRET_ACCESS_TOKEN_EXPIRY ||
  '15m';

const getRefreshTokenExpiry = () =>
  process.env.REFRESH_TOKEN_EXPIRY ||
  process.env.SECRET_REFRESH_TOKEN_EXPIRY ||
  '7d';

const generateAccessToken = (User) => {
  return jwt.sign(
    {
      _id: User._id,
      fullName: User.fullName,
      email: User.email,
      role: User .role,
    },
    getAccessTokenSecret(),
    { expiresIn: getAccessTokenExpiry() }
  );
};

const generateRefreshToken = (User) => {
  return jwt.sign({ _id: User._id }, getRefreshTokenSecret(), {
    expiresIn: getRefreshTokenExpiry(),
  });
};

export { generateAccessToken, generateRefreshToken };
