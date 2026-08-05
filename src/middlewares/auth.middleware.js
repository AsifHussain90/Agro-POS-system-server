import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/errorHandler.js";
import { User } from "../model/user.model.js";
import { getAccessTokenSecret } from "../utils/tokenGenerator.js";

const getAccessTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded;

  try {
    decoded = jwt.verify(token, getAccessTokenSecret());
  } catch {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = await User.findById(decoded._id).select("-password");

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.isBlocked) throw new ApiError(403, "User is blocked");

  next();
});

const checkRole = (role) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (req.user.role !== role) throw new ApiError(403, "Forbidden");
    next();
  });

export const isAdmin = checkRole("admin");
export const isFarmer = checkRole("farmer");
export const isUser = checkRole("user");
