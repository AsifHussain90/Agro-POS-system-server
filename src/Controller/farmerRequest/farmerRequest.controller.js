import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { createFarmerRequestService } from "../../services/farmerRequest.service.js";

const farmerRequestService = createFarmerRequestService();

export const createFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await farmerRequestService.createFarmerRequest(
    req.user._id,
    req.body,
  );
  return res
    .status(201)
    .json(new ApiResponse(201, request, "Farmer request submitted"));
});

export const getMyFarmerRequestsController = asyncHandler(async (req, res) => {
  const requests = await farmerRequestService.getMyFarmerRequests(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Farmer requests retrieved"));
});

export const updateFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await farmerRequestService.updateFarmerRequest(
    req.user._id,
    req.body,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request updated"));
});

export const deleteFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await farmerRequestService.deleteFarmerRequest(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Farmer request deleted"));
});

export const getAllFarmerRequestsController = asyncHandler(async (req, res) => {
  const requests = await farmerRequestService.getAllFarmerRequests();
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Farmer requests retrieved"));
});

export const getFarmerRequestByIdController = asyncHandler(async (req, res) => {
  const request = await farmerRequestService.getFarmerRequestById(
    req.params.id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request retrieved"));
});

export const approveFarmerRequestController = asyncHandler(async (req, res) => {
  const result = await farmerRequestService.approveFarmerRequest(
    req.params.id,
    {
      reviewedBy: req.user._id,
      reviewMessage: req.body.reviewMessage,
    },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Farmer request approved"));
});

export const rejectFarmerRequestController = asyncHandler(async (req, res) => {
  const request = await farmerRequestService.rejectFarmerRequest(
    req.params.id,
    {
      reviewedBy: req.user._id,
      reviewMessage: req.body.reviewMessage,
    },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request rejected"));
});
