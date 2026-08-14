import express from 'express';
import { verifyJWT, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAllUsersController,
  toggleBlockUserController,
  getDashboardStatsController,
} from '../Controller/admin/admin.controller.js';

const router = express.Router();

// All admin routes require JWT + admin role
router.use(verifyJWT, isAdmin);

// GET /api/admin/users
router.get('/users', getAllUsersController);

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', toggleBlockUserController);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStatsController);

export { router as adminRoutes };   