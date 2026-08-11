import express from 'express';

import {
  getAllFarmerRequests,
  getFarmerRequestById,
  approveFarmerRequest,
  rejectFarmerRequest,
} from '../controllers/adminFarmerRequest.controller.js';

import { isAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes below require:
// 1. Logged-in user
// 2. Admin role

router.use(isAdmin);
router.use(verifyJWT);

// GET /api/admin/farmer-requests
router.get('/farmer-requests', verifyJWT, isAdmin, getAllFarmerRequests);

// GET /api/admin/farmer-requests/:id
router.get('/farmer-requests/:id', getFarmerRequestById);

// PATCH /api/admin/farmer-requests/:id/reject
router.patch(
  '/farmer-requests/:id/reject',
  verifyJWT,
  isAdmin,
  rejectFarmerRequest
);

// PATCH /api/admin/farmer-requests/:id/approve
router.patch(
  '/farmer-requests/:id/approve',
  verifyJWT,
  isAdmin,
  approveFarmerRequest
);

export default router;
