import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { Farmer } from "../../model/farmer.model.js";
import { User } from "../../model/user.model.js";

export const createFarmerApplication = asyncHandler(async (req, res) => {
  const existing = await Farmer.findOne({ user: req.user._id });
  if (existing) throw new ApiError(409, "Farmer application already exists");

  const application = await Farmer.create({
    ...req.body,
    user: req.user._id,
    status: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Farmer application submitted"));
});

export const getMyFarmerProfile = asyncHandler(async (req, res) => {
  const profile = await Farmer.findOne({ user: req.user._id }).populate(
    "user",
    "fullName email role",
  );
  if (!profile) throw new ApiError(404, "Farmer profile not found");
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Farmer profile retrieved"));
});

export const updateFarmerProfile = asyncHandler(async (req, res) => {
  const profile = await Farmer.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, "Farmer profile not found");
  if (profile.status !== "approved")
    throw new ApiError(403, "Only approved farmers can update their profile");

  Object.assign(profile, req.body);
  await profile.save();

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Farmer profile updated"));
});

export const getAllFarmerRequests = asyncHandler(async (req, res) => {
  const requests = await Farmer.find().populate("user", "fullName email role");
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Farmer requests retrieved"));
});

export const getFarmerRequestById = asyncHandler(async (req, res) => {
  const request = await Farmer.findById(req.params.id).populate(
    "user",
    "fullName email role",
  );
  if (!request) throw new ApiError(404, "Farmer request not found");
  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request retrieved"));
});

export const approveFarmerRequest = asyncHandler(async (req, res) => {
  const request = await Farmer.findById(req.params.id);
  if (!request) throw new ApiError(404, "Farmer request not found");
  if (request.status !== "pending")
    throw new ApiError(400, "Request is already processed");

  request.status = "approved";
  request.approvalDate = new Date();
  await request.save();

  await User.findByIdAndUpdate(request.user || request.userId, { role: "farmer" });

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request approved"));
});

export const rejectFarmerRequest = asyncHandler(async (req, res) => {
  const request = await Farmer.findById(req.params.id);
  if (!request) throw new ApiError(404, "Farmer request not found");
  if (request.status !== "pending")
    throw new ApiError(400, "Request is already processed");

  request.status = "rejected";
  request.rejectionReason = req.body.rejectionReason || "Rejected by admin";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Farmer request rejected"));
});
