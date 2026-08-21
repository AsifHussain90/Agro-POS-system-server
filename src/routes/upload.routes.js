import express from 'express';
import rateLimit from 'express-rate-limit';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  uploadProfileImage,
  updateProfileImage,
  deleteProfileImage,
} from '../Controller/upload/upload.controller.js';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads, please try again later.' },
});

router.use(verifyJWT);

router.post('/profile-image', uploadLimiter, uploadSingle('avatar'), uploadProfileImage);
router.put('/profile-image', uploadLimiter, uploadSingle('avatar'), updateProfileImage);
router.delete('/profile-image', deleteProfileImage);

export { router as uploadRoutes };