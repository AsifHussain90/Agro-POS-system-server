// Generates access and refresh tokens for the user
import jwt from 'jsonwebtoken';

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

const generateAccessToken = (user) => {
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

const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user._id }, getRefreshTokenSecret(), {
    expiresIn: getRefreshTokenExpiry(),
  });
};

export { generateAccessToken, generateRefreshToken };
