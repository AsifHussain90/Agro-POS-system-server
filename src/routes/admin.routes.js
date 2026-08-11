import express from 'express';

import {
  getAllFarmerRequests,
  getFarmerRequestById,
  approveFarmerRequest,
  rejectFarmerRequest,
} from '../controllers/adminFarmerRequest.controller.js';

import {
  verifyJWT,
  isAdmin,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
 * All admin routes require:
 * 1. Valid JWT
 * 2. Admin role
 */
router.use(verifyJWT, isAdmin);

// GET /api/admin/farmer-requests
router.get(
  '/farmer-requests',
  getAllFarmerRequests
);

// GET /api/admin/farmer-requests/:id
router.get(
  '/farmer-requests/:id',
  getFarmerRequestById
);

// PATCH /api/admin/farmer-requests/:id/approve
router.patch(
  '/farmer-requests/:id/approve',
  approveFarmerRequest
);

// PATCH /api/admin/farmer-requests/:id/reject
router.patch(
  '/farmer-requests/:id/reject',
  rejectFarmerRequest
);

export default router;