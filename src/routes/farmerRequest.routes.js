import express from 'express';
import {
  verifyJWT,
  isUser,
  isAdmin,
} from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createFarmerRequestController,
  getMyFarmerRequestsController,
  updateFarmerRequestController,
  deleteFarmerRequestController,
  getAllFarmerRequestsController,
  getFarmerRequestByIdController,
  approveFarmerRequestController,
  rejectFarmerRequestController,
} from '../Controller/farmerRequest/farmerRequest.controller.js';
import {
  createFarmerRequestSchema,
  updateFarmerRequestSchema,
} from '../validators/farmerRequest.validator.js';

const router = express.Router();

// ── User routes ──────────────────────────────────────────────────────────────

router.post(
  '/',
  verifyJWT,
  isUser,
  validate(createFarmerRequestSchema),
  createFarmerRequestController
);

router.get('/my', verifyJWT, isUser, getMyFarmerRequestsController);

router.put(
  '/:id',
  verifyJWT,
  isUser,
  validate(updateFarmerRequestSchema),
  updateFarmerRequestController
);

router.delete('/:id', verifyJWT, isUser, deleteFarmerRequestController);

// ── Admin routes ─────────────────────────────────────────────────────────────

router.get('/', verifyJWT, isAdmin, getAllFarmerRequestsController);

router.get('/:id', verifyJWT, isAdmin, getFarmerRequestByIdController);

router.patch('/:id/approve', verifyJWT, isAdmin, approveFarmerRequestController);

router.patch('/:id/reject', verifyJWT, isAdmin, rejectFarmerRequestController);

export { router as farmerRequestRoutes };