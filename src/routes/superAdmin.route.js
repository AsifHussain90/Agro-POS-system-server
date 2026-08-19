import express from 'express';
import { verifyJWT, isSuperAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAdminSchema } from '../validators/superAdmin.validator.js';
import {
  createAdminController,
  getAllAdminsController,
  getAdminByIdController,
  activateAdminController,
  deactivateAdminController,
  deleteAdminController,
} from '../Controller/superAdmin/superAdmin.controller.js';

const router = express.Router();

router.use(verifyJWT, isSuperAdmin);

router.post('/admins', validate(createAdminSchema), createAdminController);
router.get('/admins', getAllAdminsController);
router.get('/admins/:id', getAdminByIdController);
router.patch('/admins/:id/activate', activateAdminController);
router.patch('/admins/:id/deactivate', deactivateAdminController);
router.delete('/admins/:id', deleteAdminController);

export { router as superAdminRoutes };