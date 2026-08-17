import express from 'express';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAllUsersController,
  toggleBlockUserController,
  getDashboardStatsController,
} from '../Controller/Admin/admin.controller.js';
import {
  getAllFarmerRequests,
  getFarmerRequestById,
  approveFarmerRequest,
  rejectFarmerRequest,
} from '../Controller/Admin/adminFarmerRequest.controller.js';

const router = express.Router();

// All admin routes require JWT + admin role
router.use(verifyJWT, isAdmin);

// ── Users & dashboard ────────────────────────────────────────────────────────
router.get('/users', getAllUsersController);
router.patch('/users/:id/block', toggleBlockUserController);
router.get('/dashboard', getDashboardStatsController);

// ── Farmer request review ────────────────────────────────────────────────────
router.get('/farmer-requests', getAllFarmerRequests);
router.get('/farmer-requests/:id', getFarmerRequestById);
router.patch('/farmer-requests/:id/approve', approveFarmerRequest);
router.patch('/farmer-requests/:id/reject', rejectFarmerRequest);

export { router as adminRoutes };