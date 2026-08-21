import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/errorHandler.js';
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

// ── Buyer: Create ──────────────────────────────────────────────────────────
export const createFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await createFarmerRequest(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, request, 'Farmer account request submitted successfully'));
});

// ── Buyer: Get my requests ─────────────────────────────────────────────────
export const getMyFarmerRequestsController = asyncHandler(async (req, res) => {
  const requests = await getMyFarmerRequests(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, 'Farmer requests retrieved'));
});

// ── Buyer: Update ──────────────────────────────────────────────────────────
export const updateFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await updateFarmerRequest(req.user._id, req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request updated'));
});

// ── Buyer: Delete ──────────────────────────────────────────────────────────
export const deleteFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await deleteFarmerRequest(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Farmer request deleted'));
});

// ── Admin: Get all ─────────────────────────────────────────────────────────
export const getAllFarmerRequestsController = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const requests = await getAllFarmerRequests({ page, limit });
  return res
    .status(200)
    .json(new ApiResponse(200, requests, 'Farmer requests retrieved'));
});

// ── Admin: Get by ID ───────────────────────────────────────────────────────
export const getFarmerRequestByIdController = asyncHandler(async (req, res) => {
  const request = await getFarmerRequestById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request retrieved'));
});

// ── Admin: Approve ─────────────────────────────────────────────────────────
export const approveFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await approveFarmerRequest(req.params.id, {
    reviewedBy: req.user._id,
    reviewMessage: req.body.reviewMessage,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Farmer request approved'));
});

// ── Admin: Reject ────────────────────────────────────────────────────────
export const rejectFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await rejectFarmerRequest(req.params.id, {
    reviewedBy: req.user._id,
    reviewMessage: req.body.reviewMessage,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, request, 'Farmer request rejected'));
});