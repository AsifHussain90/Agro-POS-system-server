import express from 'express';
import { verifyJWT, isFarmer } from '../middlewares/auth.middleware.js';
import {
  getMyFarmerProfile,
  updateMyFarmerProfile,
} from '../Controller/farmer/farmer.controller.js';

const router = express.Router();

// All farmer profile routes require JWT + farmer role
router.use(verifyJWT, isFarmer);

// GET /api/farmer/me
router.get('/me', getMyFarmerProfile);

// PUT /api/farmer/profile
router.put('/profile', updateMyFarmerProfile);

export default router;
