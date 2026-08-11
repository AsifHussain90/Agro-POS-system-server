import express from 'express';

import {
  getMyFarmerProfile,
  updateMyFarmerProfile,
} from '../controllers/farmer.controller.js';

import { verifyJWT, isFarmer } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(isFarmer);

// GET /api/farmer/me
router.get('/me', getMyFarmerProfile);

// PUT /api/farmer/profile
router.put('/profile', updateMyFarmerProfile);

export default router;
