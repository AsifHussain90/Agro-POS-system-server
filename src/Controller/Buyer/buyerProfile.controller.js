import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  createOrUpdateProfile,
  getProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../services/buyerProfile.service.js';

export const createOrUpdateProfileController = asyncHandler(
  async (req, res) => {
    const profile = await createOrUpdateProfile({
      userId: req.user._id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, profile, 'Buyer profile saved'));
  }
);

export const getProfileController = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Buyer profile retrieved'));
});

export const addAddressController = asyncHandler(async (req, res) => {
  const profile = await addAddress({
    userId: req.user._id,
    address: req.body,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, profile, 'Address added'));
});

export const getAddressesController = asyncHandler(async (req, res) => {
  const addresses = await getAddresses(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, addresses, 'Addresses retrieved'));
});

export const updateAddressController = asyncHandler(async (req, res) => {
  const profile = await updateAddress({
    userId: req.user._id,
    addressId: req.params.id,
    address: req.body,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Address updated'));
});

export const deleteAddressController = asyncHandler(async (req, res) => {
  const profile = await deleteAddress({
    userId: req.user._id,
    addressId: req.params.id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Address deleted'));
});

export const setDefaultAddressController = asyncHandler(async (req, res) => {
  const profile = await setDefaultAddress({
    userId: req.user._id,
    addressId: req.params.id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'Default address set'));
});