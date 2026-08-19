import { BuyerProfile } from '../model/buyerProfile.model.js';
import ApiError from '../utils/errorHandler.js';

export const createBuyerProfileService = ({
  BuyerProfileModel = BuyerProfile,
} = {}) => ({
  createOrUpdateProfile: async ({ userId, payload }) => {
    let profile = await BuyerProfileModel.findOne({ userId });

    if (profile) {
      Object.assign(profile, payload);
      await profile.save();
    } else {
      profile = await BuyerProfileModel.create({
        userId,
        ...payload,
      });
    }

    return profile;
  },

  getProfile: async (userId) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Buyer profile not found');
    return profile;
  },

  addAddress: async ({ userId, address }) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Buyer profile not found');

    // If new address is default, unset others
    if (address.isDefault) {
      profile.savedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    profile.savedAddresses.push(address);
    await profile.save();
    return profile;
  },

  getAddresses: async (userId) => {
    const profile = await BuyerProfileModel.findOne({ userId }).select(
      'savedAddresses'
    );
    if (!profile) throw new ApiError(404, 'Buyer profile not found');
    return profile.savedAddresses;
  },

  updateAddress: async ({ userId, addressId, address }) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Buyer profile not found');

    const addr = profile.savedAddresses.id(addressId);
    if (!addr) throw new ApiError(404, 'Address not found');

    // If setting as default, unset others
    if (address.isDefault) {
      profile.savedAddresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    Object.assign(addr, address);
    await profile.save();
    return profile;
  },

  deleteAddress: async ({ userId, addressId }) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Buyer profile not found');

    profile.savedAddresses = profile.savedAddresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await profile.save();
    return profile;
  },

  setDefaultAddress: async ({ userId, addressId }) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Buyer profile not found');

    const target = profile.savedAddresses.id(addressId);
    if (!target) throw new ApiError(404, 'Address not found');

    profile.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
    target.isDefault = true;

    await profile.save();
    return profile;
  },

  getDefaultAddress: async (userId) => {
    const profile = await BuyerProfileModel.findOne({ userId });
    if (!profile) return null;

    return (
      profile.savedAddresses.find((addr) => addr.isDefault) ||
      profile.savedAddresses[0] ||
      null
    );
  },
});

const buyerProfileService = createBuyerProfileService();

export const createOrUpdateProfile = buyerProfileService.createOrUpdateProfile;
export const getProfile = buyerProfileService.getProfile;
export const addAddress = buyerProfileService.addAddress;
export const getAddresses = buyerProfileService.getAddresses;
export const updateAddress = buyerProfileService.updateAddress;
export const deleteAddress = buyerProfileService.deleteAddress;
export const setDefaultAddress = buyerProfileService.setDefaultAddress;
export const getDefaultAddress = buyerProfileService.getDefaultAddress;