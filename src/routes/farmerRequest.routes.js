import express from 'express';
import { verifyJWT, isUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createFarmerRequestController,
  getMyFarmerRequestsController,
  updateFarmerRequestController,
  deleteFarmerRequestController,
} from '../Controller/farmerRequest/farmerRequest.controller.js';
import {
  createFarmerRequestSchema,
  updateFarmerRequestSchema,
} from '../validators/farmerRequest.validator.js';

const router = express.Router();

router.post(
  '/',
  verifyJWT,
  isUser,
  validate(createFarmerRequestSchema),
  createFarmerRequestController
);

router.get('/my', verifyJWT, getMyFarmerRequestsController);

router.put(
  '/:id',
  verifyJWT,
  isUser,
  validate(updateFarmerRequestSchema),
  updateFarmerRequestController
);

router.delete('/:id', verifyJWT, isUser, deleteFarmerRequestController);

export { router as farmerRequestRoutes };
