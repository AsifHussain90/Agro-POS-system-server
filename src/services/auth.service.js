import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import {
  createFarmerRequest,
  getMyFarmerRequests,
  updateFarmerRequest,
  deleteFarmerRequest,
  getAllFarmerRequests,
  getFarmerRequestById,
  approveFarmerRequest,
  rejectFarmerRequest,
} from '../../services/farmerRequest.service.js';

export const createFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await createFarmerRequest(req.user._id, req.body);
  return res
    .status(201)
    .json(
      new ApiResponse(201, request, 'Farmer account request submitted successfully')
    );
});

export const getMyFarmerRequestsController = asyncHandler(async (req, res) => {
  const requests = await getMyFarmerRequests(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, 'Farmer requests retrieved'));
});

export const updateFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await updateFarmerRequest(
    req.user._id,
    req.params.id,
    req.body
  );
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request updated'));
});

export const deleteFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await deleteFarmerRequest(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Farmer request deleted'));
});

// FIXED: Pass pagination params from req.query to service
export const getAllFarmerRequestsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const requests = await getAllFarmerRequests({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, requests, 'Farmer requests retrieved'));
});

export const getFarmerRequestByIdController = asyncHandler(async (req, res) => {
  const request = await getFarmerRequestById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request retrieved'));
});

export const approveFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await approveFarmerRequest(req.params.id, {
    reviewedBy: req.user._id,
    reviewMessage: req.body.reviewMessage,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Farmer request approved'));
});

export const rejectFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await rejectFarmerRequest(req.params.id, {
    reviewedBy: req.user._id,
    reviewMessage: req.body.reviewMessage,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request rejected'));
});