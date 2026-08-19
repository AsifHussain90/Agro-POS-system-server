import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  superAdminRegisterSchema,
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  profile,
  changePassword,
  superAdminRegister,
} from '../Controller/auth/auth.controller.js';

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts, please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/signup', registerLimiter, validate(registerSchema), register);
router.post('/superadmin-register', registerLimiter, validate(superAdminRegisterSchema), superAdminRegister);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/profile', verifyJWT, profile);
router.post('/change-password', verifyJWT, validate(changePasswordSchema), changePassword);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

export { router as authRoutes };