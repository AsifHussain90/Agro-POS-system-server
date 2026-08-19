import express from 'express';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAllUsersController,
  toggleBlockUserController,
  getDashboardStatsController,
  getAllOrdersAdminController,
  getOrderByIdAdminController,
  getAllBuyersController,
} from '../Controller/Admin/admin.controller.js';
import {
  getAllFarmerRequestsController,
  getFarmerRequestByIdController,
  approveFarmerRequestController,
  rejectFarmerRequestController,
} from '../Controller/Admin/adminFarmerRequest.controller.js';

const router = express.Router();

router.use(verifyJWT, isAdmin);

// Users & dashboard
router.get('/users', getAllUsersController);
router.patch('/users/:id/block', toggleBlockUserController);
router.get('/dashboard', getDashboardStatsController);

// Orders
router.get('/orders', getAllOrdersAdminController);
router.get('/orders/:id', getOrderByIdAdminController);

// Buyers
router.get('/buyers', getAllBuyersController);

// Farmer request review
router.get('/farmer-requests', getAllFarmerRequestsController);
router.get('/farmer-requests/:id', getFarmerRequestByIdController);
router.patch('/farmer-requests/:id/approve', approveFarmerRequestController);
router.patch('/farmer-requests/:id/reject', rejectFarmerRequestController);

export { router as adminRoutes };