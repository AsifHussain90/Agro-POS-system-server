import express from 'express';
import { verifyJWT, isBuyer } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBuyerProfileSchema,
  addressSchema,
} from '../validators/buyerProfile.validator.js';
import {
  createOrUpdateProfileController,
  getProfileController,
  addAddressController,
  getAddressesController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
} from '../Controller/buyerProfile/buyerProfile.controller.js';

const router = express.Router();

router.use(verifyJWT, isBuyer);

router.post('/profile', validate(createBuyerProfileSchema), createOrUpdateProfileController);
router.get('/profile', getProfileController);
router.post('/addresses', validate(addressSchema), addAddressController);
router.get('/addresses', getAddressesController);
router.put('/addresses/:id', validate(addressSchema), updateAddressController);
router.delete('/addresses/:id', deleteAddressController);
router.patch('/addresses/:id/default', setDefaultAddressController);

export { router as buyerProfileRoutes };