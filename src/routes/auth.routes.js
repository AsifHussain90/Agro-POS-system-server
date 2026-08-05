import express from "express";
import rateLimit from "express-rate-limit";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  profile,
} from "../Controller/auth/auth.controller.js";

const router = express.Router();

// Changed name to localAuthLimiter
const localAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Update the middleware usage below
router.post("/register", localAuthLimiter, validate(registerSchema), register);
router.post("/signup", localAuthLimiter, validate(registerSchema), register);
router.post("/login", localAuthLimiter, validate(loginSchema), login);
router.get("/profile", verifyJWT, profile);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);

export { router as authRoutes };
