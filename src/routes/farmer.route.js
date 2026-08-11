import express from 'express';

import { getMyFarmerProfile } from '../controllers/farmer.controller.js';

import {
  verifyJWT,
  isFarmer,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// All farmer routes require:
// 1. Valid JWT
// 2. User role = farmer

router.use(verifyJWT);
router.use(isFarmer);

// GET /api/farmer/me
router.get('/me', getMyFarmerProfile);

export default router;