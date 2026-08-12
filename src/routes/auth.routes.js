import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  profile,
} from '../Controller/auth/auth.controller.js';

const router = express.Router();

// ── Strict limiter for account creation ──────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, //  5 registrations per 15 min — prevents spam
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts, please try again later.' },
});

// ── Moderate limiter for login ─────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, //  20 attempts per 15 min — allows failed passwords
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/signup', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/profile', verifyJWT, profile);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

export { router as authRoutes };