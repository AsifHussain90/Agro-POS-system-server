/*Service: Handles the authentication logic

The service is responsible for things like:

Checking if the user already exists
Creating a new user in the database
Checking if the password is correct
Generating access and refresh tokens
Saving the refresh token to the database*/

import { User } from "../model/user.model.js";
import ApiError from "../utils/errorHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGenerator.js";
//toSafeUser function is defined here,which takes a user object and returns a safe version
//  of the user object without sensitive information like password and refresh token.
//  It also includes the user's avatar information if available.
export const toSafeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatar: user.avatar?.url
    ? { url: user.avatar.url, publicId: user.avatar.publicId }
    : null,
});

//issueTokens function is defined here, which takes a user object and generates access
// and refresh tokens for the user then saved to the database and returned
//  along with a safe version of the user object.
const issueTokens = async (
  user,
  { accessTokenGenerator, refreshTokenGenerator },
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
//createAuthService function is defined here, which takes optional
//  dependencies for the user model and token generators and returns
//  an object with register and login methods.
export const createAuthService = ({
  UserModel = User,
  accessTokenGenerator = generateAccessToken,
  refreshTokenGenerator = generateRefreshToken,
} = {}) => ({
  register: async ({ fullName, email, password }) => {
    const normalizedEmail = email.toLowerCase();

    const exists = await UserModel.findOne({ email: normalizedEmail });

    if (exists) throw new ApiError(409, "User already exists");

    const user = await UserModel.create({
      fullName,
      email: normalizedEmail,
      password,
      role: "user",
    });

    return issueTokens(user, { accessTokenGenerator, refreshTokenGenerator });
  },

  login: async ({ email, password }) => {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) throw new ApiError(401, "Invalid email or password");

    const match = await user.isPasswordCorrect(password);

    if (!match) throw new ApiError(401, "Invalid email or password");

    return issueTokens(user, { accessTokenGenerator, refreshTokenGenerator });
  },
});

const authService = createAuthService();

export const register = authService.register;
export const login = authService.login;
