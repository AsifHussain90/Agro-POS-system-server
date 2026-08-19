import { FarmerRequest } from '../model/farmerRequest.model.js';
import { User } from '../model/user.model.js';
import { Farmer } from '../model/farmer.model.js';
import ApiError from '../utils/errorHandler.js';

export const createFarmerRequestService = ({
  farmerRequestModel = FarmerRequest,
  userModel = User,
  farmerModel = Farmer,
} = {}) => ({
  createFarmerRequest: async (userId, payload) => {
    const user = await userModel.findById(userId).select('fullName email role');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role !== 'user') {
      throw new ApiError(403, 'Only users can submit a farmer account request');
    }

    const existingRequest = await farmerRequestModel.findOne({ userId });

    if (existingRequest) {
      throw new ApiError(409, 'You already have a farmer account request');
    }

    try {
      const request = await farmerRequestModel.create({
        userId,
        userInfo: {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        farmName: payload.farmName,
        farmDescription: payload.farmDescription,
        location: payload.location,
        farmSize: payload.farmSize,
        crops: payload.crops,
        farmImages: payload.farmImages || [],
        status: 'pending',
      });

      return await request.populate('userId', 'fullName email role');
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, 'You already have a farmer account request');
      }
      throw error;
    }
  },

  getMyFarmerRequests: async (userId) => {
    return farmerRequestModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email role');
  },

  updateFarmerRequest: async (userId, requestId, payload) => {
    const request = await farmerRequestModel.findOne({
      _id: requestId,
      userId,
      status: 'pending',
    });

    if (!request) {
      throw new ApiError(404, 'Pending farmer request not found');
    }

    Object.assign(request, payload);
    await request.save();

    return request.populate('userId', 'fullName email role');
  },

  deleteFarmerRequest: async (userId, requestId) => {
    const request = await farmerRequestModel.findOne({
      _id: requestId,
      userId,
      status: 'pending',
    });

    if (!request) {
      throw new ApiError(404, 'Pending farmer request not found');
    }

    await request.deleteOne();
    return { deleted: true };
  },

    getAllFarmerRequests: async ({ page = 1, limit = 10 } = {}) => {
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      farmerRequestModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'fullName email role'),
      farmerRequestModel.countDocuments(),
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  },

  getFarmerRequestById: async (id) => {
    const request = await farmerRequestModel
      .findById(id)
      .populate('userId', 'fullName email role');

    if (!request) throw new ApiError(404, 'Farmer request not found');
    return request;
  },

  approveFarmerRequest: async (id, { reviewedBy, reviewMessage }) => {
    const request = await farmerRequestModel.findById(id);
    if (!request) throw new ApiError(404, 'Farmer request not found');

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Request is already processed');
    }

    const user = await userModel.findById(request.userId);
    if (!user) throw new ApiError(404, 'User not found');

    // Prevent duplicate farmer profiles
    const existingFarmer = await farmerModel.findOne({ userId: user._id });
    if (existingFarmer) {
      throw new ApiError(409, 'Farmer profile already exists for this user');
    }

    // Create farmer profile from request data
    const farmer = await farmerModel.create({
      userId: user._id,
      requestId: request._id,
      farmName: request.farmName,
      farmDescription: request.farmDescription,
      location: request.location,
      farmSize: request.farmSize,
      crops: request.crops,
      farmImages: request.farmImages,
      isActive: true,
      isVerified: true,
    });

    // Update request status
    request.status = 'approved';
    request.reviewedBy = reviewedBy;
    request.reviewMessage = reviewMessage || 'Approved by admin';
    request.reviewedAt = new Date();
    await request.save();

    // Promote user to farmer
    user.role = 'farmer';
    await user.save({ validateBeforeSave: false });

    return {
      request: await request.populate('userId', 'fullName email role'),
      farmer,
    };
  },

  rejectFarmerRequest: async (id, { reviewedBy, reviewMessage }) => {
    const request = await farmerRequestModel.findById(id);
    if (!request) throw new ApiError(404, 'Farmer request not found');

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Request is already processed');
    }

    request.status = 'rejected';
    request.reviewedBy = reviewedBy;
    request.reviewMessage = reviewMessage || 'Rejected by admin';
    request.reviewedAt = new Date();
    await request.save();

    return request.populate('userId', 'fullName email role');
  },
});

const farmerRequestService = createFarmerRequestService();

export const createFarmerRequest = farmerRequestService.createFarmerRequest;
export const getMyFarmerRequests = farmerRequestService.getMyFarmerRequests;
export const updateFarmerRequest = farmerRequestService.updateFarmerRequest;
export const deleteFarmerRequest = farmerRequestService.deleteFarmerRequest;
export const getAllFarmerRequests = farmerRequestService.getAllFarmerRequests;
export const getFarmerRequestById = farmerRequestService.getFarmerRequestById;
export const approveFarmerRequest = farmerRequestService.approveFarmerRequest;
export const rejectFarmerRequest = farmerRequestService.rejectFarmerRequest;